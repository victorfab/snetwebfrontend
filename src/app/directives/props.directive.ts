import {
  Directive,
  ElementRef,
  Input,
  Renderer2
} from "@angular/core";
@Directive({
  selector: "[appProps]",
})
export class PropsDirective {
  @Input() set appProps(props: any) {
    this.setProps(props);
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  setProps(props: any): void {
    if (props) {
      const p = Object.keys(props);
      p.forEach((propName) => {
        this.renderer.setAttribute(
          this.el.nativeElement,
          propName,
          props[propName]
        );
      });
    }
  }
}
