import { Component, ViewChild, OnInit } from '@angular/core';
import {
  CdkDrag,
  CdkDragDrop, CdkDragEnd, CdkDragMove,
  CdkDragStart,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import {MatPaginator} from "@angular/material/paginator";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef, MatHeaderRow,
  MatHeaderRowDef, MatRow, MatRowDef,
  MatTable,
  MatTableDataSource
} from "@angular/material/table";
import {CommonModule} from "@angular/common";
import {MatSort} from "@angular/material/sort";
import {MatIconButton} from "@angular/material/button";
import {VERSION} from "@angular/cdk";

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, MatTable, MatSort, CdkDropListGroup, MatColumnDef, MatHeaderCell, CdkDropList, CdkDrag, MatIconButton, MatCell, MatCellDef, MatHeaderRowDef, MatHeaderRow, MatRowDef, MatRow, MatHeaderCellDef],
  templateUrl: './table.component.html',
  styleUrl: './table.component.css'
})
export class TableComponent implements OnInit {

  // columns = [
  //   {key: 'id', text: 'id'},
  //   {key: 'item_name', text: 'Item Name', isName:true},
  //   {key: 'c3', text: 'Column3'},
  //   {key: 'c4', text: 'Column4'},
  //   {key: 'c5', text: 'Column5'},
  //
  // ];
  //
  // get nameColumn(): any {
  //   let nameColumn = null;
  //   this.columns.forEach(column => {
  //     if (column.isName) {
  //       nameColumn = column;
  //     }
  //   });
  //   return nameColumn;
  // }
  //
  // rows:any = [
  //   {id:'1',item_name:'Name Field a2',c3:'a3',c4:'a4',c5:'a5'},
  //   {id:'2',item_name:'Name Field b2',c3:'b3',c4:'b4',c5:'b5'},
  //   {id:'3',item_name:'Name Field c2',c3:'c3',c4:'c4',c5:'c5'},
  //   {id:'4',item_name:'Name Field d2',c3:'d3',c4:'d4',c5:'d5'},
  //   {id:'5',item_name:'Name Field e2',c3:'e3',c4:'e4',c5:'e5'},
  // ];

  //drop(event: CdkDragDrop<string[]>) {
   // moveItemInArray(this.columns, event.previousIndex, event.currentIndex);
  //}

  //dropRow(event: CdkDragDrop<string[]>) {
    //moveItemInArray(this.rows, event.previousIndex, event.currentIndex);
  //}

  name = 'Angular ' + VERSION.major;
  style: any = null;
  offset:any=null
  getPos: number = 0;

  movies = [
    {title:'Episode I - The Phantom Menace',text:''},
    {title:'Episode II - Attack of the Clones',text:''},
    {title:'Episode III - Revenge of the Sith',text:''},
    {title:'Episode IV - A New Hope',text:''},
    {title:'Episode V - The Empire Strikes Back',text:''},
    {title:'Episode VI - Return of the Jedi',text:''},
    {title:'Episode VII - The Force Awakens',text:''},
    {title:'Episode VIII - The Last Jedi',text:''},
    {title:'Episode IX – The Rise of Skywalker',text:''},
  ];


  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }
  onDragStarted(event:CdkDragStart<any>,index:number)
  {
    //you can use
    this.movies[index].text="moved"
    //or use
    event.source.data.text="moving...."
  }
  onDragEnded(event:CdkDragEnd<any>,index:number)
  {
    event.source.data.text="moved!!"
    const el = document.getElementsByClassName('example-box')[3] as HTMLElement;
    //el.style.position = "relative"
  }
  setStyle(event: MouseEvent) {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    this.style = { width: rect.width + 'px', height: rect.height + 'px'}
    this.offset={x:event.offsetX,y:event.offsetY };
  }
  public onDragMove(event: CdkDragMove<any>): void {
    const el = document.getElementsByClassName('example-box')[3] as HTMLElement;
    //const el=(document.getElementsByClassName('cdk-drag-preview')[3])as any
    const xPos = event.pointerPosition.x;// - this.offset.x;
    const yPos = event.pointerPosition.y;// - this.offset.y;

    if (this.getPos === 0)
      this.getPos = yPos - 1
    if (yPos > this.getPos){
      this.getPos++
      let top = el.getBoundingClientRect().top;
      const elHeight = el.offsetHeight;
      const elGrZeroTop = el.offsetTop
      console.log(top)
      console.log(elHeight)
      console.log(elGrZeroTop)

      const nextEl = Math.round(top / elHeight);
      console.log("nextEl", nextEl)
      if (top % elHeight === 0){
        const nextEl = top / elHeight;
        console.log("nextEl", nextEl)
      }
      console.log("going down")
    }else{
      this.getPos--
      console.log("going up")
    }

    el.style.zIndex = '100';
    //el.style.position = "absolute"
    el.style.width = "100%";
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
  }


ngOnInit(): void {
  }

  dragStarted($event: any, columnIndex: number) {
    // Get the table element
    var table = document.getElementsByTagName("table")[0] as HTMLTableElement;

    // Initialize an array to store the column data
    var columnData = [];

    // Iterate through each row in the table body
    for (var i = 0, row; row = table.rows[i]; i++) {
      // Get the cell in the specified column for the current row
      var cell = row.cells[columnIndex];

      // Add the cell data to the columnData array
      columnData.push(cell.textContent);
    }

    // Log the column data to the console
    console.log("Column " + (columnIndex + 1) + " Data:", columnData);
  }
}
