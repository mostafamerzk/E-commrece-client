import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CategoriesComponent } from './categories.component';
import { CategoryService } from '../../../../core/services/category.service';
import { MessageService, ConfirmationService, Confirmation } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Category } from '../../../../core/models/category.model';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;
  let messageServiceMock: jasmine.SpyObj<MessageService>;
  let confirmationServiceMock: jasmine.SpyObj<ConfirmationService>;

  const mockCategories = [
    {
      _id: '1',
      name: 'Cat 1',
      slug: 'cat-1',
      image: { secure_url: 'url1', public_id: 'id1' },
      createdAt: new Date().toISOString(),
    },
    {
      _id: '2',
      name: 'Dog 1',
      slug: 'dog-1',
      image: { secure_url: 'url2', public_id: 'id2' },
      createdAt: new Date().toISOString(),
    },
  ];

  beforeEach(async () => {
    categoryServiceMock = {
      getAll: jasmine.createSpy('getAll').and.returnValue(of({ categories: mockCategories })),
      create: jasmine.createSpy('create').and.returnValue(of({ category: mockCategories[0] })),
      update: jasmine.createSpy('update').and.returnValue(of({ category: mockCategories[0] })),
      delete: jasmine.createSpy('delete').and.returnValue(of({ message: 'Deleted' })),
      getById: jasmine.createSpy('getById'),
    } as unknown as jasmine.SpyObj<CategoryService>;

    messageServiceMock = {
      add: jasmine.createSpy('add'),
    } as unknown as jasmine.SpyObj<MessageService>;

    confirmationServiceMock = {
      confirm: jasmine
        .createSpy('confirm')
        .and.callFake((config: Confirmation) => config.accept?.()),
    } as unknown as jasmine.SpyObj<ConfirmationService>;

    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [
        provideNoopAnimations(),
        { provide: CategoryService, useValue: categoryServiceMock },
      ],
    })
      .overrideComponent(CategoriesComponent, {
        set: {
          providers: [
            { provide: MessageService, useValue: messageServiceMock },
            { provide: ConfirmationService, useValue: confirmationServiceMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories on init', () => {
    expect(categoryServiceMock.getAll).toHaveBeenCalled();
    expect(component.categories().length).toBe(2);
  });

  it('should filter categories by search query', () => {
    component.searchQuery.set('cat');
    expect(component.filteredCategories().length).toBe(1);
    expect(component.filteredCategories()[0].name).toBe('Cat 1');

    component.searchQuery.set('dog');
    expect(component.filteredCategories().length).toBe(1);
    expect(component.filteredCategories()[0].name).toBe('Dog 1');

    component.searchQuery.set('');
    expect(component.filteredCategories().length).toBe(2);
  });

  it('should open create dialog on button click', () => {
    component.showDialog();
    expect(component.displayDialog).toBeTrue();
    expect(component.isEditing).toBeFalse();
    expect(component.categoryForm.name).toBe('');
  });

  it('should open edit dialog with pre-filled data', () => {
    component.editCategory(mockCategories[0] as Category);
    expect(component.displayDialog).toBeTrue();
    expect(component.isEditing).toBeTrue();
    expect(component.categoryForm.name).toBe('Cat 1');
    expect(component.categoryForm.id).toBe('1');
  });

  it('should call create when saving a new category with file', () => {
    component.showDialog();
    component.categoryForm.name = 'New Cat';
    component.selectedFile = new File([''], 'test.png');

    component.saveCategory();

    expect(categoryServiceMock.create).toHaveBeenCalledWith(
      { name: 'New Cat' },
      component.selectedFile
    );
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
  });

  it('should call update when saving an existing category', () => {
    component.editCategory(mockCategories[0] as Category);
    component.categoryForm.name = 'Updated Cat';

    component.saveCategory();

    expect(categoryServiceMock.update).toHaveBeenCalledWith(
      '1',
      { name: 'Updated Cat' },
      undefined
    );
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
  });

  it('should call delete() with correct id when delete is confirmed', () => {
    component.deleteCategory(mockCategories[0] as Category);

    expect(confirmationServiceMock.confirm).toHaveBeenCalled();
    expect(categoryServiceMock.delete).toHaveBeenCalledWith('1');
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
  });

  it('should show error toast if loading fails', () => {
    categoryServiceMock.getAll.and.returnValue(throwError(() => new Error('Fail')));
    component.loadCategories();
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' })
    );
  });
});
