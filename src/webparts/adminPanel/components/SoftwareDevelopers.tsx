import * as React from 'react';
import { escape } from '@microsoft/sp-lodash-subset';
import { Pivot, PivotItem } from 'office-ui-fabric-react/lib/Pivot';
import SharePointService from '../../../services/SharePoint/SharePointService';
import { PeoplePicker, PrincipalType } from "@pnp/spfx-controls-react/lib/PeoplePicker";
import {  PrimaryButton, Label } from 'office-ui-fabric-react';
import {
  MessageBar,
  MessageBarType
} from 'office-ui-fabric-react';
import {
  DetailsList,
  DetailsListLayoutMode,
  Selection,
  SelectionMode,
  IColumn,
} from 'office-ui-fabric-react/lib/DetailsList';

interface ISoftwareDeveloperState {
  selectedItems: any;
  allPersonsFromGroup: any;
  disabledButton: boolean;
  errorMsg: string;
  error: boolean;

  columns: IColumn[];
  items: IDocument[];
  isModalSelection: boolean;
  isCompactMode: boolean;
  announcedMessage?: string;
}
export interface IDocument {
  key: string;
  Title: string;
  email: string;
  modifiedBy: string;
  dateModified: string;
  ElSpecStatus: string;
  VersionLabel: string;
  Modified: string;
  Editor: any;
}
export class SoftwareDevelopers extends React.Component<{}, ISoftwareDeveloperState> {
  private _selection: Selection;

  constructor(props) {

    super(props);
    this.getPeoplePickerItems = this.getPeoplePickerItems.bind(this);
    this.addToGroup = this.addToGroup.bind(this);
    
    const columns: IColumn[] = [
      {
        key: 'column1',
        name: 'Name',
        fieldName: 'title',
        minWidth: 170,
        maxWidth: 170,
        
        isRowHeader: true,
        isResizable: true,
        isSorted: true,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'Sorted A to Z',
        sortDescendingAriaLabel: 'Sorted Z to A',
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: true,
        
      },
      {
        key: 'column2',
        name: 'Email',
        fieldName: 'email',
        minWidth: 150,
        maxWidth: 150,
        isRowHeader: true,
        isResizable: true,
        isSorted: false,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'Sorted A to Z',
        sortDescendingAriaLabel: 'Sorted Z to A',
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: false,
        
      },

      {
        key: 'column2',
        name: 'Login Name',
        fieldName: 'LoginName',
        minWidth: 150,
        maxWidth: 150,
        isRowHeader: true,
        isResizable: true,
        isSorted: false,
        isSortedDescending: false,
        sortAscendingAriaLabel: 'Sorted A to Z',
        sortDescendingAriaLabel: 'Sorted Z to A',
        onColumnClick: this._onColumnClick,
        data: 'string',
        isPadded: false,
        
      }

    ];

    this.state = {
      selectedItems: [],
      allPersonsFromGroup: [],
      disabledButton: true,
      errorMsg: '',
      error: false,

      items: [],
      columns: columns,
      isModalSelection: false,
      isCompactMode: false,
      announcedMessage: undefined,
    }

    this._selection = new Selection({
      onSelectionChanged: () => {
        console.log(this._selection.getSelection())
        
        this.setState({
        });
      },
    });

    
    
    SharePointService.getSoftwareDeveloperGroupMembers().then(rs => {
      console.log(rs);
      let usrs = rs.value.map(a => ({'title': a.Title, 'email': a.Email, 'LoginName': a.LoginName}))
      console.log(usrs);
      this.setState({
        items: usrs
      })
      
    })
  }

  public render(): React.ReactElement<{}> {
    return (
      <div>

        {this.state.error &&
          <MessageBar
            messageBarType={MessageBarType.error}
            isMultiline={false}
            
            dismissButtonAriaLabel="Close"
          >
            {this.state.errorMsg}
            
          </MessageBar>
        }

        <PeoplePicker
        context={SharePointService.context}
        titleText="Choose people for adding to software developer group"
        personSelectionLimit={3}
        //groupName={"User"} // Leave this blank in case you want to filter from all users
        showtooltip={true}
        isRequired={false}
        disabled={false}
        selectedItems={this.getPeoplePickerItems}
        showHiddenInUI={true}
        principalTypes={[PrincipalType.User]}
        resolveDelay={300} 
        tooltipMessage = "Enter first 3 letters"
        defaultSelectedUsers = {this.state.selectedItems.length == 0 && []}
        />
        
      <PrimaryButton disabled={this.state.disabledButton}  text="Add to user group" onClick={_ => this.addToGroup()}/>

        <hr></hr>
      
        <div className="ms-Grid" dir="ltr">

        <div className="ms-Grid-row">
        <span className="ms-Grid-col ms-sm6 ms-md8 ms-lg8 ms-xl8">
        <Label>SoftwareDeveloper group members</Label>
        </span>
        <span className="ms-Grid-col ms-sm6 ms-md4 ms-lg4 ms-xl4">
          <PrimaryButton style={{}} text="Remove from group" onClick={_ => this.removeFromGroup()}/>  
        </span>
        </div>
      <DetailsList
              items={this.state.items}
              compact={this.state.isCompactMode}
              columns={this.state.columns}
              selectionMode={SelectionMode.multiple}
              getKey={this._getKey}
              setKey="multiple"
              layoutMode={DetailsListLayoutMode.justified}
              isHeaderVisible={true}
              selection={this._selection}
              selectionPreservedOnEmptyClick={true}
              enterModalSelectionOnTouch={true}
              ariaLabelForSelectionColumn="Toggle selection"
              ariaLabelForSelectAllCheckbox="Toggle selection for all items"
              checkButtonAriaLabel="Row checkbox"
            />
            </div>
      </div>
    );
  }

  private getPeoplePickerItems(items: any[]) {
    this.setState({
      errorMsg: '',
      error: false
    })

    let err = false;

    console.log('Items:', items);
    loop1:
    for (let i = 0; i< items.length; i++){
      loop2:
      for(let j = 0; j< this.state.items.length; j++){
        console.log(items[i].secondaryText);
        console.log(this.state.items[j].email);
        if (items[i].secondaryText == this.state.items[j].email){
          err = true;
  
        this.setState({
          errorMsg: `User ${items[i].secondaryText} is already in software developer group. Please remove this user from people picker`,
          error: true
        })

        break loop1;
        }
      }
      
      
    }
    
    if (items.length == 0  || err){
      this.setState({
        disabledButton: true,
      });
    }
    else {
      this.setState({
        disabledButton: false
      });
    }

    this.setState({
      selectedItems: items
    })
    return items;
    
  }

  private addToGroup() {
    //console.log(`treba da se dodaju u grupu sledeci ljudi: (${this.state.selectedItems.length})`);
    //console.log(this.state.selectedItems);
    //console.log(this.state.selectedItems[0].LoginName);
    SharePointService.addUserToSoftwareDeveloperGroup(this.state.selectedItems[0].loginName).then(rs => {
      this.setState({
        selectedItems: [],
        disabledButton: true,
      })
      console.log(rs);
      SharePointService.getSoftwareDeveloperGroupMembers().then(rss => {
        console.log(rss);
        let usrs = rss.value.map(a => ({'title': a.Title, 'email': a.Email, 'LoginName': a.LoginName}))
        console.log(usrs);
        this.setState({
          items: usrs
        })
        
      })
    })
    
    
}

private removeFromGroup() {

}

public componentDidUpdate(previousProps: any, previousState: ISoftwareDeveloperState) {
  if (previousState.isModalSelection !== this.state.isModalSelection && !this.state.isModalSelection) {
    this._selection.setAllSelected(false);
  }
}

private _getKey(item: any, index?: number): string {
  
  return item.key;
}




private _getSelectionDetails(): string {
  const selectionCount = this._selection.getSelectedCount();

  switch (selectionCount) {
    case 0:
      return 'No items selected';
    case 1:
      console.log('1 item selected: ' + (this._selection.getSelection()[0] as IDocument).Title)
      return '1 item selected: ' + (this._selection.getSelection()[0] as IDocument).Title;
    default:
      return `${selectionCount} items selected`;
  }
}

private _onColumnClick = (ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
  const { columns, items } = this.state;
  const newColumns: IColumn[] = columns.slice();
  const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
  newColumns.forEach((newCol: IColumn) => {
    if (newCol === currColumn) {
      currColumn.isSortedDescending = !currColumn.isSortedDescending;
      currColumn.isSorted = true;
      this.setState({
        announcedMessage: `${currColumn.name} is sorted ${
          currColumn.isSortedDescending ? 'descending' : 'ascending'
        }`,
      });
    } else {
      newCol.isSorted = false;
      newCol.isSortedDescending = true;
    }
  });
  const newItems = _copyAndSort(items, currColumn.fieldName!, currColumn.isSortedDescending);
  this.setState({
    columns: newColumns,
    items: newItems,
  });
}
}

function _copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
  const key = columnKey as keyof T;
  return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
}





