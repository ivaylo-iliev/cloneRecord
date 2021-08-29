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

export default class CloneRecord extends LightningElement {
	@api recordId;
	@api objectApiName;
	@api showCalculatedFields = false;
	@api fieldsToRemove = [];
	@api defaultFieldValues;

	layoutDetails = [];
	fieldList = [];
	openSections = [];

	formCanBeRendered = false;
	showSpinner = true;

	@wire(getRecordUi, {recordIds: '$recordId', layoutTypes: 'Full', modes: 'Edit'})
	getRecordUiData({error, data}){
		if(data){
			console.log('layout information', JSON.parse(JSON.stringify(data)));
			this.parseFieldDetails(data);
			this.fieldsToRemove = [...DEFAULT_FIELDS_TO_REMOVE];
			console.log('fieldsToRemove: ', this.fieldsToRemove);
			if(this.fieldList !== null && this.fieldList !== undefined && this.fieldList.length > 0){
				this.parseLayoutData(data);
				if(this.defaultFieldValues){
					this.setDefaultValues();					
				}
				this.showSpinner = false;
				this.formCanBeRendered = true;
			}

			
		}

		if(error){

		}
	}

	handleFormLoad(event){
		
	}

	handleFormSubmit(event){
		event.preventDefault();
		this.showSpinner = true;
		let fieldsToSubmit = event.detail.fields;
		
		this.fieldsToRemove.forEach( field => {
			delete fieldsToSubmit[field];
		});

		let recordToSubmit = {
			apiName: this.objectApiName,
			fields: fieldsToSubmit
		}

		createRecord(recordToSubmit).then( result => {
			console.log(JSON.parse(JSON.stringify(result)));
		}).catch(error => {
			
		});
	}

	handleFormCancel(){
		this.dispatchEvent(new CloseActionScreenEvent());
	}

	parseLayoutData(data){
		let sections = [];
	
		for(const[key, value] of Object.entries(data.layouts[this.objectApiName])){
			let layoutDetails = value;

			layoutDetails.Full.Edit.sections.forEach(item => {
				let section = {};
				console.log('section: ', JSON.parse(JSON.stringify(item)));
				section.id = item.id;
				section.label = item.heading;
				section.columns = item.columns;
				if(!item.collapsible){
					this.openSections.push(item.id);
				}
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
									cssClass: `slds-col slds-size_1-of-${item.columns}`
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

	setDefaultValues(){
		let fieldList = this.template.querySelectorAll('lightning-input-field');
		fieldList.forEach(field => {
			this.defaultFieldValues.forEach(defautlValueItem => {
				if(field.fieldName === defautlValueItem.name){
					field.value = defaultValueItem.value;
				}
			});

			this.fieldsToRemove.forEach(fieldToRemove => {
				if(field.fieldName === fieldToRemove){
					field.value = '';
				}
			})

		});		
	}
}