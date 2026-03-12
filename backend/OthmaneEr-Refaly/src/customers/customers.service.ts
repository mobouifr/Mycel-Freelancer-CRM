import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

export interface Customer {
  id: number;
  name: string;
  email: string;
}

@Injectable()
export class CustomersService {
  // In-memory array acting as the database
  private customers: Customer[] = [];
  private nextId = 1;

  // CREATE
  create(createCustomerDto: CreateCustomerDto): Customer {
    const newCustomer: Customer = {
      id: this.nextId++,
      ...createCustomerDto,
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

    // Merge the old customer data with the new updated data
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

    // Remove 1 item at the specific index and return it
    const [deletedCustomer] = this.customers.splice(customerIndex, 1);
    return deletedCustomer;
  }
}