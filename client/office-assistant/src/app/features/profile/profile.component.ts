import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../core/models/user.model';
import moment from 'moment';

interface Education {
  id?: string;
  degree: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade?: string;
  description?: string;
}

interface Experience {
  id?: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  skills?: string[];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private toastr = inject(ToastrService);

  user = signal<User | null>(null);
  loading = false;
  activeTab = 'personal';
  showEducationModal = false;
  showExperienceModal = false;
  editingEducation: Education | null = null;
  editingExperience: Experience | null = null;

  profileForm: FormGroup;
  educationForm: FormGroup;
  experienceForm: FormGroup;

  educationList: Education[] = [];
  experienceList: Experience[] = [];

  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
  genders = ['Male', 'Female', 'Other'];
  maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];

  constructor() {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      primaryEmail: ['', [Validators.required, Validators.email]],
      secondaryEmail: ['', Validators.email],
      primaryPhone: ['', Validators.required],
      secondaryPhone: [''],
      permanentAddress: ['', Validators.required],
      temporaryAddress: [''],
      bloodGroup: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      nationality: ['', Validators.required],
      linkedin: [''],
      designation: ['', Validators.required]
    });

    this.educationForm = this.formBuilder.group({
      degree: ['', Validators.required],
      institution: ['', Validators.required],
      fieldOfStudy: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      grade: [''],
      description: ['']
    });

    this.experienceForm = this.formBuilder.group({
      jobTitle: ['', Validators.required],
      company: ['', Validators.required],
      location: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      current: [false],
      description: ['', Validators.required],
      skills: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadEducation();
    this.loadExperience();
  }

  loadUserProfile(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.profileForm.patchValue({
        ...currentUser,
        dob: currentUser.dob ? moment(currentUser.dob).format('YYYY-MM-DD') : ''
      });
    }
  }

  loadEducation(): void {
    // Mock data - replace with actual API call
    this.educationList = [
      {
        id: '1',
        degree: 'Bachelor of Technology',
        institution: 'Indian Institute of Technology',
        fieldOfStudy: 'Computer Science',
        startDate: '2018-07-01',
        endDate: '2022-06-30',
        grade: '8.5 CGPA',
        description: 'Specialized in software engineering and data structures'
      }
    ];
  }

  loadExperience(): void {
    // Mock data - replace with actual API call
    this.experienceList = [
      {
        id: '1',
        jobTitle: 'Software Developer',
        company: 'Tech Solutions Inc.',
        location: 'Bangalore, India',
        startDate: '2022-07-01',
        endDate: '',
        current: true,
        description: 'Developing web applications using Angular and Node.js. Working on microservices architecture and cloud deployment.',
        skills: ['Angular', 'Node.js', 'TypeScript', 'AWS']
      }
    ];
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  updateProfile(): void {
    if (this.profileForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    this.loading = true;
    const formData = this.profileForm.value;
    
    // Mock API call - replace with actual service
    setTimeout(() => {
      this.toastr.success('Profile updated successfully');
      this.loading = false;
    }, 1000);
  }

  // Education Methods
  openEducationModal(education?: Education): void {
    this.editingEducation = education || null;
    if (education) {
      this.educationForm.patchValue(education);
    } else {
      this.educationForm.reset();
    }
    this.showEducationModal = true;
  }

  closeEducationModal(): void {
    this.showEducationModal = false;
    this.editingEducation = null;
    this.educationForm.reset();
  }

  saveEducation(): void {
    if (this.educationForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const formData = this.educationForm.value;
    
    if (this.editingEducation) {
      // Update existing
      const index = this.educationList.findIndex(e => e.id === this.editingEducation!.id);
      if (index !== -1) {
        this.educationList[index] = { ...this.editingEducation, ...formData };
      }
      this.toastr.success('Education updated successfully');
    } else {
      // Add new
      const newEducation: Education = {
        id: Date.now().toString(),
        ...formData
      };
      this.educationList.push(newEducation);
      this.toastr.success('Education added successfully');
    }

    this.closeEducationModal();
  }

  deleteEducation(education: Education): void {
    if (confirm('Are you sure you want to delete this education record?')) {
      this.educationList = this.educationList.filter(e => e.id !== education.id);
      this.toastr.success('Education deleted successfully');
    }
  }

  // Experience Methods
  openExperienceModal(experience?: Experience): void {
    this.editingExperience = experience || null;
    if (experience) {
      this.experienceForm.patchValue({
        ...experience,
        skills: experience.skills?.join(', ') || ''
      });
    } else {
      this.experienceForm.reset();
    }
    this.showExperienceModal = true;
  }

  closeExperienceModal(): void {
    this.showExperienceModal = false;
    this.editingExperience = null;
    this.experienceForm.reset();
  }

  saveExperience(): void {
    if (this.experienceForm.invalid) {
      this.toastr.error('Please fill all required fields');
      return;
    }

    const formData = this.experienceForm.value;
    const skills = formData.skills ? formData.skills.split(',').map((s: string) => s.trim()) : [];
    
    if (this.editingExperience) {
      // Update existing
      const index = this.experienceList.findIndex(e => e.id === this.editingExperience!.id);
      if (index !== -1) {
        this.experienceList[index] = { 
          ...this.editingExperience, 
          ...formData, 
          skills 
        };
      }
      this.toastr.success('Experience updated successfully');
    } else {
      // Add new
      const newExperience: Experience = {
        id: Date.now().toString(),
        ...formData,
        skills
      };
      this.experienceList.push(newExperience);
      this.toastr.success('Experience added successfully');
    }

    this.closeExperienceModal();
  }

  deleteExperience(experience: Experience): void {
    if (confirm('Are you sure you want to delete this experience record?')) {
      this.experienceList = this.experienceList.filter(e => e.id !== experience.id);
      this.toastr.success('Experience deleted successfully');
    }
  }

  onCurrentJobChange(): void {
    const isCurrent = this.experienceForm.get('current')?.value;
    const endDateControl = this.experienceForm.get('endDate');
    
    if (isCurrent) {
      endDateControl?.setValue('');
      endDateControl?.disable();
    } else {
      endDateControl?.enable();
    }
  }

  formatDate(date: string): string {
    return moment(date).format('MMM YYYY');
  }

  calculateDuration(startDate: string, endDate: string, current: boolean): string {
    const start = moment(startDate);
    const end = current ? moment() : moment(endDate);
    const duration = moment.duration(end.diff(start));
    
    const years = Math.floor(duration.asYears());
    const months = Math.floor(duration.asMonths()) % 12;
    
    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) {
      if (result) result += ' ';
      result += `${months} month${months > 1 ? 's' : ''}`;
    }
    
    return result || '1 month';
  }

  getInitials(firstName?: string, lastName?: string): string {
    if (!firstName || !lastName) return 'U';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }
}