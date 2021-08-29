import { LightningElement, api, wire } from 'lwc';
import {getRecordUi} from 'lightning/uiRecordApi';
import {NavigationMixin} from 'lightning/navigation';
import {CloseActionScreenEvent} from 'lightning/actions';
import {ShowToastEvent} from "lightning/platformShowToastEvent";

export default class CloneRecord extends LightningElement {
	@api recordId;
	@api objectApiName;
	@api showCalculatedFields = false;
	@api fieldsToRemove = [];

	layoutDetails = [];
	fieldList = [];

	formCanBeRendered = true;
	showSpinner = false;

	@wire(getRecordUi, {recordIds: '$recordId', layoutTypes: 'Full', modes: 'Edit'})
	getRecordUiData({error, data}){
		if(data){
			console.log('layout information', JSON.parse(JSON.stringify(data)));
			this.parseFieldDetails(data);
			if(this.fieldList !== null && this.fieldList !== undefined && this.fieldList.length > 0){
				this.parseLayoutData(data);
			}
			
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
				section.collpsible = item.collpsible;
				section.rows = [];
			
				item.layoutRows.forEach(row => {
					let layoutRow = [];
				    row.layoutItems.forEach(layoutItem => {
						let field = {};
						layoutItem.layoutComponents.forEach(layoutComponent => {
							if (layoutComponent?.apiName && this.fieldList.includes(layoutComponent.apiName)) {						
								field = {
									apiName: layoutComponent.apiName,
									cssClass: `slds-size_1-of-${item.columns}`
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

		console.log('sections: ', sections);
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

		console.log(this.fieldList);
	}
}