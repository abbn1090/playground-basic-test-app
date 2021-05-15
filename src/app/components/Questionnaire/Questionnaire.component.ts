import { QuestionnaireResponse } from './../../models/questionnaireResponse';
import { element } from 'protractor';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ApiService } from 'src/app/services/api-service.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-Questionnaire',
  templateUrl: './Questionnaire.component.html',
  styleUrls: ['./Questionnaire.component.scss'],
})
export class QuestionnaireComponent implements OnInit {
  questonnaireForm: FormGroup;
  elements;
  questionnairJSON;
  isSubmitted = false;
  questionnaireResponse: string;
  constructor(private apiService: ApiService, private fb: FormBuilder) {}
  async ngOnInit() {
    this.questionnairJSON = await this.apiService
      .getQuestionnaireJson()
      .toPromise();
    this.elements = this.questionnairJSON?.item;
    this.questonnaireForm = this.fb.group({
      elements: this.fb.array([...this.questions]),
    });
  }
  getElementControl(index: any, linkId: any) {
    const control = (<FormArray>this.questonnaireForm.get('elements')).get(
      index.toString()
    );
    const sec_control = control.get(linkId);
    return sec_control;
  }
  getNestedElementControl(
    index: any,
    innerIndex: any,
    linkId: any,
    innerLinkId: any
  ) {
    const control = (<FormArray>this.questonnaireForm.get('elements')).get(
      index.toString()
    );
    const sec_control = control.get(linkId);
    const third_control = (<FormArray>sec_control).get(innerIndex.toString());
    const forth_control = (<FormGroup>third_control).controls[innerLinkId];

    return forth_control;
  }
  get questions(): FormGroup[] {
    let elms = [];
    for (let i = 0; i < this.elements.length; i++) {
      if (this.elements[i].type === 'group') {
        let nst = [];
        for (let j = 0; j < this.elements[i].item.length; j++) {
          let validation = this.createFormElement(
            this.elements[i].item[j].type
          );
          nst.push(
            this.fb.group({
              [this.elements[i].item[j].linkId]: validation,
            })
          );
        }
        elms.push(
          this.fb.group({
            [this.elements[i].linkId]: this.fb.array([...nst]),
          })
        );
      } else {
        let validation = this.createFormElement(this.elements[i].type);
        elms.push(
          this.fb.group({
            [this.elements[i].linkId]: validation,
          })
        );
      }
    }
    return elms;
  }
  createFormElement(type: string) {
    if (type === 'boolean') {
      return [false, [Validators.required]];
    }
    if (type === 'string') {
      return ['', [Validators.required]];
    }
    if (type === 'date') {
      return [
        null,
        [
          Validators.required,
          Validators.pattern(
            /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/
          ),
        ],
      ];
    }
  }
  createObject() {
    this.isSubmitted = true;
    if (this.questonnaireForm.invalid) {
      // this.loading = false;
      return;
    }
    console.log('this.questonnaireForm valid');
    let formatedAnswers = formatAnswers(this.questonnaireForm.value);
    let { resourceType, id, url, status, subjectType, date, item } =
      this.questionnairJSON;

    const myClonedArray = Object.assign([], item);
    let items2 = myClonedArray.map((itm) => {
      if (itm.type === 'group') {
        let tm = { text: itm.text, linkId: itm.linkId, item: itm.item };
        tm.item = tm.item.map((it) => {
          return formatItem(it, formatedAnswers);
        });
        // delete itm.type;
        return tm;
      } else {
        return formatItem(itm, formatedAnswers);
      }
    });
    let response: QuestionnaireResponse = {
      resourceType,
      identifier: id,
      status,
      subject: subjectType,
      authored: date,
      source: url,
      item: items2,
    };
    console.log('questionnaireResponse', response);
    this.questionnaireResponse = JSON.stringify(response, undefined, 4);
  }
}
function formatItem(itm, formatedAnswers) {
  let tm = { text: itm.text, linkId: itm.linkId };
  switch (itm.type) {
    case 'date':
      tm['answer'] = { valueDate: formatedAnswers[itm.linkId] };
      break;
    case 'string':
      tm['answer'] = { valueString: formatedAnswers[itm.linkId] };
      break;
    case 'boolean':
      tm['answer'] = { valueBoolean: formatedAnswers[itm.linkId] };
      break;

    default:
      break;
  }
  return tm;
}
function formatAnswers(elements) {
  let ary = elements.elements;
  let masterary = [];
  for (let i = 0; i < ary.length; i++) {
    let elm = ary[i];
    let keys = Object.keys(elm);
    for (let key of keys) {
      if (Array.isArray(elm[key])) {
        let fl = elm[key].flat();
        masterary = masterary.concat(fl);
      } else {
        masterary.push(elm);
      }
    }
  }
  let obj = {};
  for (let elll of masterary) {
    obj = { ...obj, ...elll };
  }
  return obj;
}
