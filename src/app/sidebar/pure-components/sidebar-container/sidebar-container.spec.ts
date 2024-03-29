import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SidebarContainerComponent } from './sidebar-container';
import * as menuLeft from './sidebar-container.metadata' ;

describe('SidebarContainerComponent', () => {
  let component: SidebarContainerComponent;
  let fixture: ComponentFixture<SidebarContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule(menuLeft.moduleMetaData)
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SidebarContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
