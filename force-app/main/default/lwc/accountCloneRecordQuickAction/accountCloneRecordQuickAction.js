import { LightningElement, api } from 'lwc';
import {CloseActionScreenEvent} from 'lightning/actions';


export default class AccountCloneRecordQuickAction extends LightningElement {
	@api recordId;
	objectApiName = 'Account';	
	showCalculatedFields = false;

	overrideFieldValues = [
		{name: 'Name', value: 'Test value'},
		{name: 'Ownership', value: 'Public'},
	];
	
	formHeader = 'Clone Account';

	handleClose(){
		this.dispatchEvent(new CloseActionScreenEvent());
	}
}