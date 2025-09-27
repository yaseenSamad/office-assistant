import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterProfileComponent implements OnInit {
  userForm!: FormGroup;

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  genders = ['Male', 'Female', 'Other'];
  maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  departments = ['IT Department', 'HR Department', 'Managing Department'];
  subDepartments = ['Sub A', 'Sub B', 'Sub C'];
  roles = ['Employee', 'HR'];
  employees = [
    { id: 1, name: 'HR Admin' },
    { id: 2, name: 'John Doe' },
    { id: 3, name: 'Alice Smith' }
  ];
  showPassword = false;

  constructor(private fb: FormBuilder, private toastr: ToastrService,private userService: UserService) {}

  ngOnInit(): void {
    this.userForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      primaryPhone: ['', [Validators.required,Validators.pattern(/^[0-9]{10}$/)]],
      secondaryPhone: ['',[Validators.pattern(/^[0-9]{10}$/)]],
      primaryEmail: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]],
      secondaryEmail: ['', Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)],
      temporaryAddress: [''],
      permanentAddress: ['', Validators.required],
      officeId: ['', Validators.required],
      bloodGroup: ['A+', Validators.required],
      dob: ['', Validators.required],
      gender: ['Male', Validators.required],
      maritalStatus: ['Single', Validators.required],
      nationality: ['', Validators.required],
      linkedin: [''],
      department: ['IT Department', Validators.required],
      subDepartment: ['Sub A', Validators.required],
      role: ['Employee', Validators.required],
      designation: ['', Validators.required],
      reporterId: [1, Validators.required]
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  submitUser() {
    if (this.userForm.invalid) {
      this.toastr.error('Please fill in all required fields correctly!', 'Form Error');
      this.userForm.markAllAsTouched();
      return;
    }

    console.log('User Payload:', this.userForm.value);
    this.userService.createUser(this.userForm.value).subscribe({
      next: (res) => {
        this.toastr.success('User created successfully!', 'Success');
        this.userForm.reset();
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Failed to create user','Failure');
      },
    });

  }


}
