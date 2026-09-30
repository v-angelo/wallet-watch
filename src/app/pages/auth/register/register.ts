import { Component } from '@angular/core';
import { Navbar } from '../../../shared/navbar/navbar';
import { RouterLink } from '@angular/router';

@Component({
  imports: [Navbar, RouterLink],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {}
