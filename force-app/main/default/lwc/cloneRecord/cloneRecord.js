import { LightningElement, api, wire } from 'lwc';
import {getRecordUi} from 'lightning/uiRecordApi';
import {NavigationMixin} from 'lightning/navigation';
import {CloseActionScreenEvent} from 'lightning/actions';
import {ShowToastEvent} from "lightning/platformShowToastEvent";

export default class CloneRecord extends LightningElement {
	@api recordId;
	@api objectApiName;

	layoutDetails = {};

	formCanBeRendered = true;
	showSpinner = false;

	@wire(getRecordUi, {recordIds: '$recordId', layoutTypes: 'Full', modes: 'Edit'})
	getRecordUiData({error, data}){
		if(data){

		}

		if(error){

		}
	}

	handleFormLoad(event){
		
	}

	handleFormSubmit(event){

	}

	handleFormCancel(event){

	}

	
}