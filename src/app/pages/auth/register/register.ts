import { Component } from '@angular/core';
import { Navbar } from '../../landing/components/navbar/navbar';

@Component({
  imports: [Navbar],
  selector: 'app-register',
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {}
