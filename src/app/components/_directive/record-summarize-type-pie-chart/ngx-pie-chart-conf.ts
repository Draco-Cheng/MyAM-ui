export class NgxPieChartConf {
  single: any[];
  multi: any[];

  view: any[] = [900, 400];

  // options
  showLegend = true;

  // pie
  showLabels = true;
  explodeSlices = false;
  doughnut = true;

  constructor(single) {
    Object.assign(this, { single });


    // padding left, right 15px;
    this.view[0] = window.innerWidth - 30;

    if (window.innerWidth < 730) {
      this.showLegend = false;
    }
  }

  onSelect(event) {
    console.log(event);
  }

}