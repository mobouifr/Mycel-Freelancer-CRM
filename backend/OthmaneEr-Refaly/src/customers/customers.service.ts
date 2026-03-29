import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

export interface Customer {
  id: number; // kept as number for in-memory simplicity, represents UUID in DB
  userid: number; // represents user_id from DB
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
  status: 'active' | 'inactive' | 'archived'; 
}

@Injectable()
export class CustomersService {
  private customers: Customer[] = []; // harawkan dyal database
  private nextId = 1;

  // CREATE
  create(createCustomerDto: CreateCustomerDto | any): Customer {
    const newCustomer: Customer = {
      id: this.nextId++,

      userid: createCustomerDto.userid !== undefined ? createCustomerDto.userid : 1, 
      name: createCustomerDto.name || '',
      email: createCustomerDto.email || '',
      phone: createCustomerDto.phone || '',
      company: createCustomerDto.company || '',
      address: createCustomerDto.address || '',
      status: createCustomerDto.status || 'active', // default status
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
  update(id: number, updateCustomerDto: UpdateCustomerDto | any): Customer {
    const customerIndex = this.customers.findIndex(c => c.id === id);

    if (customerIndex === -1) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Merge existing customer data with the incoming updates
    this.customers[customerIndex] = {
      ...this.customers[customerIndex],
      ...updateCustomerDto,
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