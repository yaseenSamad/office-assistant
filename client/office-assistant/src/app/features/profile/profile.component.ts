import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; // Import Router
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { commonService } from '../../core/services/common.service';
import { EducationService } from '../../core/services/education.service';
import { WorkExperienceService } from '../../core/services/work_experience.service';
import { User } from '../../core/models/user.model';
import moment from 'moment';
import { PayrollService } from '../../core/services/payroll.service';
import { Salary } from '../../core/models/salary.model';

interface Education {
  courseId?: string;
  course: string;
  institution: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade?: string;
  description?: string;
}

interface WorkExperience {
  workExperienceId?: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate?: string;
  currentWorkStatus: boolean;
  description: string;
  skills?: string;
}

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
  private workExperienceService = inject(WorkExperienceService);
  private educationService = inject(EducationService);
  private router = inject(Router); // Inject Router
  private payrollService = inject(PayrollService);

  user = signal<User | null>(null);
  salary = signal<Salary | null>(null);
  loading = false;
  activeTab: 'personal' | 'education' | 'experience' | 'salary' = 'personal';

  // Form Groups
  personalInfoForm!: FormGroup;
  professionalInfoForm!: FormGroup;
  educationForm!: FormGroup;
  experienceForm!: FormGroup;
  passwordResetForm!: FormGroup;
  salaryForm!: FormGroup;

  // Data for dropdowns
  genders = ['Male', 'Female', 'Other'];
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  maritalStatuses = ['Single', 'Married', 'Divorced', 'Widowed'];
  roles: string[] = [];
  departments: any[] = [];
  users: User[] = [];

  // Education
  educationList: Education[] = [];
  showEducationModal = false;
  editingEducation: Education | null = null;

  // Experience
  experienceList: WorkExperience[] = [];
  showExperienceModal = false;
  editingExperience: WorkExperience | null = null;

  // Password Reset
  showPasswordResetModal = false;
  selectedFile: File | null = null;

  ngOnInit(): void {
    this.initializeForms();
    this.loadDropdownData();
    
    // Check if a userId is provided in the route
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.loadUserProfile(userId);
      } else {
        // If no userId in route, load current user's profile
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          this.loadUserProfile(currentUser.userId);
        } else {
          this.toastr.error('User not authenticated.');
          this.router.navigate(['/auth/login']); // Redirect to login if no user and no ID
        }
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.uploadProfilePicture();
    }
  }

  uploadProfilePicture(): void {
    if (!this.selectedFile || !this.user()) return;

    this.loading = true;
    const formData = new FormData();
    formData.append('profilePicture', this.selectedFile);

    this.userService.updateUser(this.user()!.userId, formData).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.toastr.success('Profile picture updated successfully!');
          this.user.set(res.data);
          this.selectedFile = null;
        } else {
          this.toastr.error('Failed to update profile picture');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Profile picture upload error:', error);
        this.toastr.error('Failed to upload profile picture');
        this.loading = false;
      }
    });
  }

  initializeForms(): void {
    this.personalInfoForm = this.formBuilder.group({
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
    });

    this.professionalInfoForm = this.formBuilder.group({
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
      course: ['', Validators.required],
      institution: ['', Validators.required],
      fieldOfStudy: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      grade: [''],
      description: ['']
    });

    this.experienceForm = this.formBuilder.group({
      title: ['', Validators.required],
      company: ['', Validators.required],
      location: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      currentWorkStatus: [false],
      description: ['', Validators.required],
      skills: ['']
    });

    this.salaryForm = this.formBuilder.group({
      amount: [null, [Validators.required, Validators.min(0)]],
      payType: ['monthly', Validators.required]
    });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('newPassword')?.value === form.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  loadDropdownData(): void {
    this.roles = this.commonService.rolesList;
    console.log(this.roles)
    this.departments = this.commonService.departmentList;
    this.userService.getAllUsers().subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          const allUsers = res.data || [];
          this.users = allUsers.filter((u: any) => 
            u.role?.toUpperCase() === 'ADMIN' || u.role?.toUpperCase() === 'HR'
          );
        }
      },
      error: (error) => {
        console.error('Error loading users:', error);
      }
    });
  }

  loadUserProfile(userId: string): void {
    this.loading = true;
    this.userService.getUserById(userId).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.user.set(res.data);
          this.populateProfileForm(res.data);
          this.educationList = res.data.educations || [];
          this.experienceList = res.data.workExperiences || [];
          this.loadUserSalary(userId);
        } else {
          this.toastr.error('Failed to load user profile.');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toastr.error('An error occurred while fetching the profile.');
        this.loading = false;
      }
    });
  }

  populateProfileForm(user: any): void {
    this.personalInfoForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      dob: user.dob,
      gender: user.gender,
      bloodGroup: user.bloodGroup,
      maritalStatus: user.maritalStatus,
      nationality: user.nationality,
      primaryEmail: user.primaryEmail,
      secondaryEmail: user.secondaryEmail,
      primaryPhone: user.primaryPhone,
      secondaryPhone: user.secondaryPhone,
      linkedin: user.linkedin,
      permanentAddress: user.permanentAddress,
      temporaryAddress: user.temporaryAddress,
    });

    this.professionalInfoForm.patchValue({
      username: user.username,
      role: user.role?.toUpperCase(),
      department: user.department?.itemCode || '',
      subDepartment: user.subDepartment,
      designation: user.designation,
      reporter: user.reporter
    });

    if (!this.canEditPersonalInfo()) {
      this.personalInfoForm.disable();
    }
    if (!this.canEditProfessionalInfo()) {
      this.professionalInfoForm.disable();
    }
  }

  updatePersonalInfo(): void {
    if (this.personalInfoForm.invalid) {
      this.toastr.error('Please fill all required personal information fields correctly.');
      return;
    }
    this.updateProfile(this.personalInfoForm.getRawValue());
  }

  updateProfessionalInfo(): void {
    if (this.professionalInfoForm.invalid) {
      this.toastr.error('Please fill all required professional information fields correctly.');
      return;
    }
    const formValue = this.professionalInfoForm.getRawValue();
    const selectedDept = this.departments.find(d => d.itemCode === formValue.department);
    if (selectedDept) {
      formValue.department = selectedDept;
    }
    this.updateProfile(formValue);
  }

  updateProfile(formValue: any): void {
    this.loading = true;
    const userId = this.user()?.userId;
    if (!userId) return;

    this.userService.updateUser(userId, formValue).subscribe({
      next: (res: any) => {
        if (res.statusCode === 200) {
          this.toastr.success('Profile updated successfully!');
          this.user.set(res.data);
        } else {
          this.toastr.error('Failed to update profile.');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Profile update error:', error);
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
      error: (error) => {
        console.error('Password reset error:', error);
        this.toastr.error('An error occurred while resetting the password.');
      }
    });
  }

  // canEdit(): boolean {
  //   return this.authService.isAdminOrHR();
  // }

  canEditPersonalInfo(): boolean {
    return this.isOwnProfile();
  }

  canEditProfessionalInfo(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.user()) {
      return false;
    }
    const requesterRole = currentUser.role.toUpperCase();
    const targetRole = this.user()!.role.toUpperCase();

    if (requesterRole === 'ADMIN') {
      return true;
    }
    if (requesterRole === 'HR' && targetRole === 'EMPLOYEE') {
      return true;
    }
    return false;
  }

  canResetPassword(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.user()) {
      return false;
    }
    // A user can always reset their own password
    if (currentUser.userId === this.user()?.userId) {
      return true;
    }
    return this.canEditProfessionalInfo(); // Delegate to the same logic
  }

  canDeleteUser(): boolean {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !this.user()) {
      return false;
    }

    if (currentUser.userId === this.user()!.userId) {
      return false;
    }
    
    const requesterRole = currentUser.role.toUpperCase();
    const targetRole = this.user()!.role.toUpperCase();

    if (requesterRole === 'ADMIN') {
      return true;
    }
    if (requesterRole === 'HR' && targetRole === 'EMPLOYEE') {
      return true;
    }

    return false;
  }

  deleteUser(): void {
    if (!this.user()) return;

    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      this.userService.deleteUser(this.user()!.userId).subscribe({
        next: () => {
          this.toastr.success('User deleted successfully');
          this.router.navigate(['/employees']);
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.toastr.error('Failed to delete user.');
        }
      });
    }
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

  canManageSalary(): boolean {
   return this.authService.isAdminOrHR()
  }

  loadUserSalary(userId: string): void { 
    if (!this.canManageSalary()) return;

    this.payrollService.getSalary(userId).subscribe({
      next: (salary) => {
        this.salary.set(salary);
        this.salaryForm.patchValue({
          amount: salary.amount,
          payType: salary.payType
        });
      },
      error: () => {
        this.salary.set(null);
        this.salaryForm.reset({ payType: 'monthly' });
      }
    });
  }

  saveSalary(): void {
    if (this.salaryForm.invalid || !this.user()) {
      this.toastr.error('Please fill all required salary fields correctly.');
      return;
    }
    const userId = this.user()!.userId;
    const salaryData = this.salaryForm.value;

    this.payrollService.createOrUpdateSalary(userId, salaryData).subscribe({
      next: (updatedSalary) => {
        this.toastr.success('Salary updated successfully!');
        this.salary.set(updatedSalary);
      },
      error: (err) => {
        this.toastr.error('Failed to update salary.');
        console.error(err);
      }
    });
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

  // Education Modal Methods
  openEducationModal(education: Education | null = null): void {
    this.editingEducation = education;
    this.educationForm.reset();
    if (education) {
      this.educationForm.patchValue({
        course: education.course,
        institution: education.institution,
        fieldOfStudy: education.fieldOfStudy,
        startDate: education.startDate,
        endDate: education.endDate,
        grade: education.grade,
        description: education.description
      });
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
      this.toastr.error('Please fill all required fields.');
      return;
    }

    const formValue = this.educationForm.value;
    const userId = this.user()?.userId;
    if (!userId) return;

    if (this.editingEducation) {
      this.educationService.updateEducation(this.editingEducation.courseId || '', formValue).subscribe({
        next: () => {
          this.toastr.success('Education updated successfully!');
          this.loadUserProfile(userId);
          this.closeEducationModal();
        },
        error: () => this.toastr.error('Failed to update education.')
      });
    } else {
      this.educationService.createEducation(userId, formValue).subscribe({
        next: () => {
          this.toastr.success('Education added successfully!');
          this.loadUserProfile(userId);
          this.closeEducationModal();
        },
        error: () => this.toastr.error('Failed to add education.')
      });
    }
  }

  deleteEducation(education: Education): void {
    if (confirm('Are you sure you want to delete this education record?')) {
      const userId = this.user()?.userId;
      if (!userId || !education.courseId) return;

      this.educationService.deleteEducation(education.courseId).subscribe({
        next: () => {
          this.toastr.success('Education deleted successfully!');
          this.loadUserProfile(userId);
        },
        error: () => this.toastr.error('Failed to delete education.')
      });
    }
  }

  // Experience Modal Methods
  openExperienceModal(experience: WorkExperience | null = null): void {
    this.editingExperience = experience;
    this.experienceForm.reset();
    if (experience) {
      this.experienceForm.patchValue({
        title: experience.title,
        company: experience.company,
        location: experience.location,
        startDate: experience.startDate,
        endDate: experience.endDate,
        currentWorkStatus: experience.currentWorkStatus,
        description: experience.description,
        skills: experience.skills
      });
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
      this.toastr.error('Please fill all required fields.');
      return;
    }

    const formValue = this.experienceForm.value;
    const experienceData: WorkExperience = {
      title: formValue.title,
      company: formValue.company,
      location: formValue.location,
      startDate: formValue.startDate,
      endDate: formValue.currentWorkStatus ? undefined : formValue.endDate,
      currentWorkStatus: formValue.currentWorkStatus,
      description: formValue.description,
      skills: formValue.skills
    };

    const userId = this.user()?.userId;
    if (!userId) return;

    if (this.editingExperience) {
      this.workExperienceService.updateWorkExperience(this.editingExperience.workExperienceId!, experienceData).subscribe({
        next: () => {
          this.toastr.success('Experience updated successfully!');
          this.loadUserProfile(userId);
          this.closeExperienceModal();
        },
        error: () => this.toastr.error('Failed to update experience.')
      });
    } else {
      this.workExperienceService.createWorkExperience(userId, experienceData).subscribe({
        next: () => {
          this.toastr.success('Experience added successfully!');
          this.loadUserProfile(userId);
          this.closeExperienceModal();
        },
        error: () => this.toastr.error('Failed to add experience.')
      });
    }
  }

  deleteExperience(experience: WorkExperience): void {
    if (confirm('Are you sure you want to delete this work experience?')) {
      const userId = this.user()?.userId;
      if (!userId || !experience.workExperienceId) return;

      this.workExperienceService.deleteWorkExperience(experience.workExperienceId).subscribe({
        next: () => {
          this.toastr.success('Experience deleted successfully!');
          this.loadUserProfile(userId);
        },
        error: () => this.toastr.error('Failed to delete experience.')
      });
    }
  }

  onCurrentJobChange(): void {
    const isCurrent = this.experienceForm.get('currentWorkStatus')?.value;
    const endDateControl = this.experienceForm.get('endDate');
    if (isCurrent) {
      endDateControl?.setValue('');
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
    return result.trim() || '1 mo';
  }

  private generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  getProfilePictureUrl(): string {
    const user = this.user();
    if (user?.profilePicture) {
      return `http://localhost:5004${user.profilePicture}`;
    }
    return 'assets/default-avatar.png';
  }

  canEdit(): boolean {
    return this.isOwnProfile();
  }

  getDepartmentName(departmentCode: string): string {
    const dept = this.departments.find(d => d.itemCode === departmentCode);
    return dept?.itemName || departmentCode;
  }

  getSkillsArray(skills: string | undefined): string[] {
    if (!skills) return [];
    return skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  }
}