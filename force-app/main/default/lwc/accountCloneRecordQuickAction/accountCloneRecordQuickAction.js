import { LightningElement, api } from 'lwc';


export default class AccountCloneRecordQuickAction extends LightningElement {
	@api recordId;
	objectApiName = 'Account';	
	showCalculatedFields = false;
	overrideFieldValues = [
		{name: 'Name', value: 'Test value'},
		{name: 'Ownership', value: 'Public'},
	];
	formHeader = 'Clone Account';
}