import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HolidayService } from '../../../core/services/holiday.service';
import { AuthService } from '../../../core/services/auth.service';
import { Holiday } from '../../../core/models/holiday.model';

@Component({
  selector: 'app-holiday-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],