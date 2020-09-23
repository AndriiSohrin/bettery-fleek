import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'info-modal',
  templateUrl: './info-modal.component.html',
  styleUrls: ['./info-modal.component.sass']
})
export class InfoModalComponent implements OnInit {
  @Input() boldName;
  @Input() name;
  @Input() link;



  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit(): void {
  }

}
