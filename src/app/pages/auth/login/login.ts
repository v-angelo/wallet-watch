import { Component } from '@angular/core';
import { Navbar } from '../../landing/components/navbar/navbar';

@Component({
  imports: [Navbar],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {}
