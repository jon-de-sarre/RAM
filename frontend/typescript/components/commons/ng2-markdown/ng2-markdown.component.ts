/* Copy of https://github.com/evanplaice/ng2-markdown
 * converting to TS as we do not transpile es6 (babel)
 * Attempting to turn transpiler on causes an internal
 * error.
 */
import { Directive, ElementRef, OnInit, Attribute } from '@angular/core';
import Showdown from 'showdown';
import { RelationshipTypesService } from '../../../services/relationship-types.service';

@Directive({
  selector: 'ng2-markdown',
  providers: [RelationshipTypesService]
})
export class MarkdownComponent implements OnInit {
  constructor (
    private elementRef:ElementRef,
    private relationshipTypesService:RelationshipTypesService,
    @Attribute('type') private type:string,
    @Attribute('code') private code:string
  ) { }

  public ngOnInit () {
    const prms = this.relationshipTypesService.getByCode(this.type, this.code);
    prms.subscribe((data) => this.process(data.defaultValue));
  }

private process(markdown:string) {
    let converter = new Showdown.Converter();
    this.elementRef.nativeElement.innerHTML = converter.makeHtml(markdown);
  }
}
