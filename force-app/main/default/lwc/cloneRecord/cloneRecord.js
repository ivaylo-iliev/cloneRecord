import { LightningElement, api, wire } from 'lwc';

import {
	getRecordUi,
    createRecord
} from 'lightning/uiRecordApi';

import {NavigationMixin} from 'lightning/navigation';
import {CloseActionScreenEvent} from 'lightning/actions';
import {ShowToastEvent} from "lightning/platformShowToastEvent";

const DEFAULT_FIELDS_TO_REMOVE = [
	'Id',
	'IsDeleted',
	'LastModifiedById',
	'LastModifiedDate',
	'LastReferencedDate',
	'LastViewedDate',
	'SystemModstamp',
	'CreatedById',
	'CreatedDate'
];

export default class CloneRecord extends NavigationMixin(LightningElement) {
	@api recordId;
	@api objectApiName;
	@api showCalculatedFields = false;
	@api fieldsToRemove = [];
	@api overrideFieldValues;
	@api formHeader;

	layoutDetails = [];
	fieldList = [];

	formCanBeRendered = false;
	showSpinner = true;

	overrideFieldValuesMap = new Map();


	@wire(getRecordUi, {recordIds: '$recordId', layoutTypes: 'Full', modes: 'Edit'})
	getRecordUiData({error, data}){
		if(data){
			this.parseFieldDetails(data);
			this.fieldsToRemove = [...DEFAULT_FIELDS_TO_REMOVE];
			if(this.fieldList !== null && this.fieldList !== undefined && this.fieldList.length > 0){
				this.parseLayoutData(data);
				
				if(this.overrideFieldValues){
					this.overrideFieldValues.forEach(value => {
						this.overrideFieldValuesMap.set(value.name, value.value);
					});
				}
				
				this.showSpinner = false;
				this.formCanBeRendered = true;
			}			
		}

		if(error){			
			error.body.pageErrors.forEach(err => {
				let message = `Status code ${err.statusCode} with error ${err.message}`;
				let errorToast = new ShowToastEvent({
													  title: 'Layout information read failed.',
													  message: message,
													  messageData: [err.statisCode, err.message],
													  mode: 'sticky',
													  variant: 'error'
												  });
				this.dispatchEvent(errorToast);
				console.log('Error reading layout information with message: ', message);
			});

			this.handleCancelClick();
		}
	}

	handleCancelClick(){
		const closeEvent = new CustomEvent('close');
		this.dispatchEvent(new CloseActionScreenEvent());
		this.dispatchEvent(closeEvent);
	}

	parseLayoutData(data){
		let sections = [];
	
		for(const[key, value] of Object.entries(data.layouts[this.objectApiName])){
			let layoutDetails = value;

			layoutDetails.Full.Edit.sections.forEach(item => {
				let section = {};
				
				section.id = item.id;
				section.label = item.heading;
				section.columns = item.columns;

				section.collpsible = item.collapsible;
				section.rows = [];
			
				item.layoutRows.forEach(row => {
					let layoutRow = [];
				    row.layoutItems.forEach(layoutItem => {
						let field = {};
						layoutItem.layoutComponents.forEach(layoutComponent => {
							if (layoutComponent?.apiName && this.fieldList.includes(layoutComponent.apiName)) {		
												
								field = {
									apiName: layoutComponent.apiName,
									cssClass: `slds-col slds-size_1-of-${item.columns}`,
								};
								layoutRow.push(field);
							}
						});
					});	
					section.rows.push(layoutRow);
				});

				sections.push(section);
            });
		}

		console.log('sections: ',sections);
		this.layoutDetails = sections;
	}

	parseFieldDetails(data){
		for(const[key, value] of Object.entries(data.objectInfos[this.objectApiName].fields)) {
			if(this.showCalculatedFields){
				this.fieldList.push(value.apiName);
			} else if(!value.calculated){
				this.fieldList.push(value.apiName);
			}
		}
	}

	handleFormLoad(){
		const inputFields = this.template.querySelectorAll('lightning-input-field');
		inputFields.forEach(field => {
			field.value = this.overrideFieldValuesMap.get(field.fieldName);
		});		
	}

	handleSubmitClick(){
		let fields = this.template.querySelectorAll('lightning-input-field');
		let fieldsToSubmit = {};		

		if(fields){
			fields.forEach(field => {
				if(!this.fieldsToRemove.includes(field.fieldName) && field.value){
					fieldsToSubmit[field.fieldName] = field.value;
				}
			})
		}

		let recordToSubmit = {
			apiName: this.objectApiName,
			fields: fieldsToSubmit
		}

		createRecord(recordToSubmit).then( result => {
			const cloneResult = result;
			const pageReference = {
				type: 'standard__recordPage',
				attributes: {
					recordId: cloneResult.id,
					actionName: 'view'
				}
			};

			let successToast = new ShowToastEvent({
				title: `${this.objectApiName} cloned`,
				message: `${this.objectApiName} record has been successfully cloned.`,
				mode: 'dismissible',
				variant: 'success'
			});


			this[NavigationMixin.Navigate](pageReference);
			this.dispatchEvent(successToast);
		}).catch(error => {
			console.log('There was an error while saving the cloned record.');
			console.log('Error message: ', JSON.parse(JSON.stringify(error)));
			
			error.body.pageErrors.forEach(err => {
				let message = `Status code ${err.statusCode} with error ${err.message}`;
				let errorToast = new ShowToastEvent({
													  title: `${this.objectApiName} cloning failed`,
													  message: message,
													  messageData: [err.statisCode, err.message],
													  mode: 'sticky',
													  variant: 'error'
												  });
				this.dispatchEvent(errorToast);
				console.log('Error while cloning with message: ', message);
			});

			this.handleCancelClick();
		});
	}
}