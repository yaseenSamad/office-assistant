import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class commonService {

departmentList = [
    {itemCode:'1',itemName: 'Technical'},
    {itemCode:'2',itemName: 'Accounting'},
    {itemCode:'3',itemName: 'Marketing'},
    {itemCode:'4',itemName: 'Managing'},
];

rolesList = ['EMPLOYEE','HR','ADMIN']


  

}
