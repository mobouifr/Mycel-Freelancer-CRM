import { Test, TestingModule } from '@nestjs/testing';
import { CustomersService } from './customers.service';
import { NotFoundException } from '@nestjs/common';

describe('CustomersService', () => {
  let service: CustomersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomersService],
    }).compile();

    service = module.get<CustomersService>(CustomersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new customer', () => {
    const customerDto = {
      name: 'Othmane',
      email: 'othmane@example.com',
      company: '1337 Tech',
    };

    const result = service.create(customerDto);

    expect(result).toMatchObject(customerDto);
    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('number');
  });

  it('should return all customers', () => {
    service.create({ name: 'User 1', email: '1@test.com' });
    service.create({ name: 'User 2', email: '2@test.com' });

    const allCustomers = service.findAll();
    expect(allCustomers.length).toBeGreaterThanOrEqual(2);
  });

  it('should find a customer by ID', () => {
    const created = service.create({ name: 'Find Me', email: 'find@test.com' });
    const found = service.findOne(created.id);

    expect(found).toEqual(created);
  });

  it('should throw NotFoundException if customer does not exist', () => {
    // Testing the error handling for an ID that definitely won't be in the array
    expect(() => service.findOne(99999)).toThrow(NotFoundException);
  });

  it('should remove a customer', () => {
    const created = service.create({ name: 'To Delete', email: 'del@test.com' });
    const initialCount = service.findAll().length;

    service.remove(created.id);
    
    expect(service.findAll().length).toBe(initialCount - 1);
    expect(() => service.findOne(created.id)).toThrow(NotFoundException);
  });
});