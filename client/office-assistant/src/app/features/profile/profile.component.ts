import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { commonService } from '../../core/services/common.service';
import { User } from '../../core/models/user.model';
import moment from 'moment';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private commonService = inject(commonService);

  user = signal<User | null>(null);
  loading = false;
  activeTab: 'personal' | 'education' | 'experience' = 'personal';

  // Form Groups
  profileForm!: FormGroup;
  educationForm!: FormGroup;
  experienceForm!: FormGroup;
  passwordResetForm!: FormGroup;

  // Data for dropdowns
  genders = ['Male', 'Female', 'Other'];
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  roles: string[] = [];
  departments: any[] = [];
  users: User[] = [];

  // Education
  educationList: any[] = [];
  showEducationModal = false;
  editingEducation: any = null;

  // Experience
  experienceList: any[] = [];
  showExperienceModal = false;
  editingExperience: any = null;

  // Password Reset
  showPasswordResetModal = false;
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.initializeForms();
    this.loadDropdownData();
    this.route.paramMap.subscribe(params => {
      const userId = params.get('id') || this.authService.getCurrentUser()?.userId;
      if (userId) {
        this.loadUserProfile(userId);
      }
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
    this.updateProfile();
  }

  initializeForms(): void {
    this.profileForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dob: ['', Validators.required],
      gender: ['', Validators.required],
      bloodGroup: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      nationality: ['', Validators.required],
      primaryEmail: ['', [Validators.required, Validators.email]],
      secondaryEmail: ['', [Validators.email]],
      primaryPhone: ['', Validators.required],
      secondaryPhone: [''],
      linkedin: [''],
      permanentAddress: ['', Validators.required],
      temporaryAddress: [''],
      username: [{ value: '', disabled: true }],
      role: ['', Validators.required],
      department: ['', Validators.required],
      subDepartment: ['', Validators.required],
      designation: ['', Validators.required],
      reporter: ['']
    });

    this.passwordResetForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

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

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  loadDropdownData(): void {
    this.roles = this.commonService.rolesList;
    this.departments = this.commonService.departmentList;
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.users = res.data;
        }
      }
    });
  }

  loadUserProfile(userId: string): void {
    this.loading = true;
    this.userService.getUserById(userId).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.user.set(res.data);
          this.profileForm.patchValue(res.data);
          if (!this.canEdit()) {
            this.profileForm.disable();
          }
          // Load education and experience
          this.educationList = res.data.educations || [];
          this.experienceList = res.data.workExperiences || [];
        } else {
          this.toastr.error('Failed to load user profile.');
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('An error occurred while fetching the profile.');
        this.loading = false;
      }
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid && !this.selectedFile) {
      this.toastr.error('Please fill all required fields correctly.');
      return;
    }

    this.loading = true;
    const userId = this.user()?.userId;
    if (!userId) return;

    const formData = new FormData();
    const formValue = this.profileForm.getRawValue();

    for (const key in formValue) {
      if (formValue.hasOwnProperty(key)) {
        formData.append(key, formValue[key]);
      }
    }

    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile, this.selectedFile.name);
    }

    this.userService.updateUser(userId, formData).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.toastr.success('Profile updated successfully!');
          this.user.set(res.data);
          this.selectedFile = null;
        } else {
          this.toastr.error('Failed to update profile.');
        }
        this.loading = false;
      },
      error: () => {
        this.toastr.error('An error occurred while updating the profile.');
        this.loading = false;
      }
    });
  }

  resetPassword(): void {
    if (this.passwordResetForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.');
      return;
    }
    const userId = this.user()?.userId;
    if (!userId) return;

    const { newPassword } = this.passwordResetForm.value;
    this.authService.resetPassword(userId, newPassword).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.toastr.success('Password reset successfully!');
          this.closePasswordResetModal();
        } else {
          this.toastr.error('Failed to reset password.');
        }
      },
      error: () => {
        this.toastr.error('An error occurred while resetting the password.');
      }
    });
  }

  canEdit(): boolean {
    return this.authService.isAdminOrHR() 
  }

  isOwnProfile(): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser?.userId === this.user()?.userId;
  }

  setActiveTab(tab: 'personal' | 'education' | 'experience'): void {
    this.activeTab = tab;
  }

  getInitials(firstName?: string, lastName?: string): string {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  }

  formatDate(date: string | null): string {
    if (!date) return 'N/A';
    return moment(date).format('MMM YYYY');
  }

  openPasswordResetModal(): void {
    this.showPasswordResetModal = true;
  }

  closePasswordResetModal(): void {
    this.showPasswordResetModal = false;
    this.passwordResetForm.reset();
  }

  // Education Modal
  openEducationModal(education: any = null): void {
    this.editingEducation = education;
    this.educationForm.reset();
    if (education) {
      this.educationForm.patchValue(education);
    }
    this.showEducationModal = true;
  }

  closeEducationModal(): void {
    this.showEducationModal = false;
    this.editingEducation = null;
  }

  saveEducation(): void {
    // Logic to save education
    this.closeEducationModal();
  }

  deleteEducation(education: any): void {
    // Logic to delete education
  }

  // Experience Modal
  openExperienceModal(experience: any = null): void {
    this.editingExperience = experience;
    this.experienceForm.reset();
    if (experience) {
      this.experienceForm.patchValue({
        ...experience,
        skills: experience.skills?.join(', ')
      });
    }
    this.showExperienceModal = true;
  }

  closeExperienceModal(): void {
    this.showExperienceModal = false;
    this.editingExperience = null;
  }

  saveExperience(): void {
    // Logic to save experience
    this.closeExperienceModal();
  }

  deleteExperience(experience: any): void {
    // Logic to delete experience
  }

  onCurrentJobChange(): void {
    const isCurrent = this.experienceForm.get('current')?.value;
    const endDateControl = this.experienceForm.get('endDate');
    if (isCurrent) {
      endDateControl?.setValue(null);
      endDateControl?.disable();
    } else {
      endDateControl?.enable();
    }
  }

  calculateDuration(startDate: string, endDate: string | null, isCurrent: boolean): string {
    const start = moment(startDate);
    const end = isCurrent ? moment() : moment(endDate);
    const duration = moment.duration(end.diff(start));
    const years = duration.years();
    const months = duration.months();
    let result = '';
    if (years > 0) {
      result += `${years} ${years > 1 ? 'yrs' : 'yr'}`;
    }
    if (months > 0) {
      result += ` ${months} ${months > 1 ? 'mos' : 'mo'}`;
    }
    return result.trim();
  }
}