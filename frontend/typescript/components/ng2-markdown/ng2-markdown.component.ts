/* Copy of https://github.com/evanplaice/ng2-markdown
 * converting to TS as we do not transpile es6 (babel)
 * Attempting to turn transpiler on causes an internal
 * error.
 */
import {Directive, ElementRef, OnInit, Input} from '@angular/core';
import Showdown from 'showdown';

@Directive({
    selector: 'ng2-markdown'
})

export class MarkdownComponent implements OnInit {

    @Input() public markdown: string;

    constructor(private elementRef: ElementRef) {
    }

    public ngOnInit() {
        this.process(this.markdown);
    }

    private process(markdown: string) {
        let converter = new Showdown.Converter();
        this.elementRef.nativeElement.innerHTML = converter.makeHtml(markdown);
    }
}
