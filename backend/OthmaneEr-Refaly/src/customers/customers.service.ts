import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  // 1. This is our "Fake Database"
  private customers = []; 

  // CREATE
  create(createCustomerDto: CreateCustomerDto) {
    const newCustomer = {
      id: Date.now(), // Generate a fake unique ID using the current timestamp
      ...createCustomerDto, // Spread the incoming data (name, email, etc.)
    };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  // READ (All)
  findAll() {
    return this.customers;
  }

  // READ (One)
  findOne(id: number) {
    const customer = this.customers.find(c => c.id === id);
    if (!customer) {
      // NestJS will automatically turn this into a 404 Not Found error for the user!
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  // UPDATE
  update(id: number, updateCustomerDto: UpdateCustomerDto) {
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
  remove(id: number) {
    const customerIndex = this.customers.findIndex(c => c.id === id);
    
    if (customerIndex === -1) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    // Remove 1 item at the specific index
    const deletedCustomer = this.customers.splice(customerIndex, 1);
    return deletedCustomer[0];
  }
}