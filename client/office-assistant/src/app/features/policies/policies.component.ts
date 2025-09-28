import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PolicyService } from '../../core/services/policy.service';
import { ToastrService } from 'ngx-toastr';
import { Policy } from '../../core/models/policy.model';
import { AuthService } from '../../core/services/auth.service';
@Component({
  selector: 'app-policy',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './policies.component.html',
  styleUrls: ['./policies.component.scss']
})
export class PolicyComponent implements OnInit {
  private policyService = inject(PolicyService);
  private authService = inject(AuthService)
  private toastr = inject(ToastrService);
  private formBuilder = inject(FormBuilder);

  policies = signal<Policy[]>([]);
  showModal = false;
  editingPolicy: Policy | null = null;
  selectedFile: File | null = null;

  // policyForm: FormGroup = this.formBuilder.group({
  //   title: ['', Validators.required],
  //   description: [''],
  //   documentUrl: ['', Validators.required],
  // });

  policyForm: FormGroup = this.formBuilder.group({
  title: ['', Validators.required],
  description: ['']
});

  ngOnInit(): void {
    this.loadPolicies();
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  loadPolicies(): void {
    this.policyService.getPolicies().subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.policies.set(res.data || []);
        }else{
          this.policies.set([]);
          this.toastr.error('Failed to load policies')
        }
      },
      error: () => this.toastr.error('Failed to load policies'),
    });
  }

  openPolicyModal(policy?: Policy): void {
    this.editingPolicy = policy || null;
    if (policy) {
      this.policyForm.patchValue(policy);
    } else {
      this.policyForm.reset();
    }
    this.showModal = true;
  }

  closePolicyModal(): void {
    this.showModal = false;
    this.editingPolicy = null;
    this.policyForm.reset();
  }

  onSubmit(): void {
    if (this.policyForm.invalid) return;

    const data = this.policyForm.value;

    const formData = new FormData();
    formData.append('title', this.policyForm.value.title);
    formData.append('description', this.policyForm.value.description);
    if (this.selectedFile) {
      formData.append('document', this.selectedFile);
    }
    const currentUserData: any = this.authService.getUserData()
    formData.append('updatedBy',currentUserData?.userId || null );

    if (this.editingPolicy) {
      this.policyService.updatePolicy(this.editingPolicy.policyId, formData).subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.toastr.success('Policy updated');
            this.loadPolicies();
            this.closePolicyModal();
          }else{
            this.toastr.error('Failed to update policy')
          }
        },
        error: () => this.toastr.error('Failed to update policy'),
      });
      return
    } else {
      // Create
      this.policyService.createPolicy(formData).subscribe({
        next: (res) => {
          if (res.statusCode === 200) {
            this.toastr.success('Policy created');
            this.loadPolicies();
            this.closePolicyModal();
          }else{
            this.toastr.error('Failed to create policy')
          }
        },
        error: () => this.toastr.error('Failed to create policy'),
      });
    }
  }

  deletePolicy(policyId: string): void {
    if (!confirm('Are you sure you want to delete this policy?')) return;

    this.policyService.deletePolicy(policyId).subscribe({
      next: (res) => {
        if (res.statusCode === 200) {
          this.toastr.success('Policy deleted');
          this.policies.set(this.policies().filter(p => p.policyId !== policyId));
        }else{
          this.toastr.error('Failed to delete policy')
        }
      },
      error: () => this.toastr.error('Failed to delete policy'),
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString();
  }

  canEdit(): boolean {
    return true;
  }

  getUserName(userId: string): string {
    return userId || 'System';
  }


}
