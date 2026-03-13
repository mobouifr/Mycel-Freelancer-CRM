import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

export interface Customer {
  id: number; // in DB this would be UUID, here we keep number for simplicity
  name: string; // required
  email?: string; // optional, should be valid email
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'archived'; // enum from schema
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class CustomersService {
  // In-memory array acting as the database
  private customers: Customer[] = [];
  private nextId = 1;

  // CREATE
  create(createCustomerDto: CreateCustomerDto): Customer {
    const now = new Date();

    const newCustomer: Customer = {
      id: this.nextId++,
      status: 'active',      // default status
      created_at: now,
      updated_at: now,
      ...createCustomerDto,  // name, email, etc.
    };

    this.customers.push(newCustomer);
    return newCustomer;
  }

  // READ (All)
  findAll(): Customer[] {
    return this.customers;
  }

  // READ (One)
  findOne(id: number): Customer {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  // UPDATE
  update(id: number, updateCustomerDto: UpdateCustomerDto): Customer {
    const customerIndex = this.customers.findIndex(c => c.id === id);

    if (customerIndex === -1) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    this.customers[customerIndex] = {
      ...this.customers[customerIndex],
      ...updateCustomerDto,
      updated_at: new Date(), // keep updated_at in sync
    };

    return this.customers[customerIndex];
  }

  // DELETE
  remove(id: number): Customer {
    const customerIndex = this.customers.findIndex(c => c.id === id);

    if (customerIndex === -1) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    const [deletedCustomer] = this.customers.splice(customerIndex, 1);
    return deletedCustomer;
  }
}