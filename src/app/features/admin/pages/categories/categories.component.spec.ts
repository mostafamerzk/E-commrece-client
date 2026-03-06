import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriesComponent } from './categories.component';
import { CategoryService } from '../../../../core/services/category.service';
import { MessageService, ConfirmationService, Confirmation } from 'primeng/api';
import { of, throwError, Subject, Observable } from 'rxjs';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import {
  Category,
  CategoriesResponse,
  CategoryResponse,
} from '../../../../core/models/category.model';
import { MessageResponse } from '../../../../core/models/shared.model';

describe('CategoriesComponent', () => {
  let component: CategoriesComponent;
  let fixture: ComponentFixture<CategoriesComponent>;
  let categoryServiceMock: jasmine.SpyObj<CategoryService>;
  let messageServiceMock: jasmine.SpyObj<MessageService>;
  let confirmationServiceMock: jasmine.SpyObj<ConfirmationService>;

  const mockCategories: Category[] = [
    {
      _id: '1',
      name: 'Cat 1',
      slug: 'cat-1',
      description: 'Description 1',
      image: { secure_url: 'url1', public_id: 'id1' },
      createdAt: new Date().toISOString(),
      createdBy: 'user1',
    },
    {
      _id: '2',
      name: 'Dog 1',
      slug: 'dog-1',
      description: 'Description 2',
      image: { secure_url: 'url2', public_id: 'id2' },
      createdAt: new Date().toISOString(),
      createdBy: 'user2',
    },
  ];

  beforeEach(async () => {
    categoryServiceMock = jasmine.createSpyObj<CategoryService>('CategoryService', [
      'getAll',
      'create',
      'update',
      'delete',
      'getById',
    ]);

    categoryServiceMock.getAll.and.returnValue(
      of({ message: 'Success', categories: mockCategories } as CategoriesResponse)
    );
    categoryServiceMock.create.and.returnValue(
      of({ message: 'Success', category: mockCategories[0] } as CategoryResponse)
    );
    categoryServiceMock.update.and.returnValue(
      of({ message: 'Success', category: mockCategories[0] } as CategoryResponse)
    );
    categoryServiceMock.delete.and.returnValue(of({ message: 'Deleted' } as MessageResponse));

    messageServiceMock = jasmine.createSpyObj<MessageService>('MessageService', ['add']);
    (messageServiceMock as unknown as { messageObserver: Observable<unknown> }).messageObserver =
      new Subject().asObservable();

    confirmationServiceMock = jasmine.createSpyObj<ConfirmationService>('ConfirmationService', [
      'confirm',
    ]);
    (
      confirmationServiceMock as unknown as { requireConfirmation$: Observable<Confirmation> }
    ).requireConfirmation$ = new Subject<Confirmation>().asObservable();
    confirmationServiceMock.confirm.and.callFake((config: Confirmation) => {
      config.accept?.();
      return confirmationServiceMock;
    });

    await TestBed.configureTestingModule({
      imports: [CategoriesComponent],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    })
      .overrideComponent(CategoriesComponent, {
        set: {
          imports: [CommonModule, FormsModule],
          schemas: [NO_ERRORS_SCHEMA],
          providers: [
            { provide: CategoryService, useValue: categoryServiceMock },
            { provide: MessageService, useValue: messageServiceMock },
            { provide: ConfirmationService, useValue: confirmationServiceMock },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CategoriesComponent);
    component = fixture.componentInstance;
    // detectChanges() intentionally deferred to each test for full control over ngOnInit timing
  });

  // ─── Initialization ───────────────────────────────────────────────────────────

  it('should create the component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should load categories on init and reflect them in the signal', () => {
    fixture.detectChanges();
    expect(categoryServiceMock.getAll).toHaveBeenCalledTimes(1);
    expect(component.categories().length).toBe(2);
    expect(component.isLoading()).toBeFalse();
  });

  it('should show an error toast and stop loading if getAll fails', () => {
    categoryServiceMock.getAll.and.returnValue(throwError(() => new Error('Network error')));

    fixture.detectChanges();

    expect(component.categories().length).toBe(0);
    expect(component.isLoading()).toBeFalse();
    expect(messageServiceMock.add).toHaveBeenCalledOnceWith(
      jasmine.objectContaining({ severity: 'error' })
    );
  });

  // ─── Search / Filter ──────────────────────────────────────────────────────────

  it('should filter categories by name (case-insensitive)', () => {
    fixture.detectChanges();

    component.searchQuery.set('cat');
    expect(component.filteredCategories().length).toBe(1);
    expect(component.filteredCategories()[0].name).toBe('Cat 1');

    component.searchQuery.set('DOG');
    expect(component.filteredCategories().length).toBe(1);
    expect(component.filteredCategories()[0].name).toBe('Dog 1');
  });

  it('should filter categories by slug', () => {
    fixture.detectChanges();

    component.searchQuery.set('dog-1');
    expect(component.filteredCategories().length).toBe(1);
    expect(component.filteredCategories()[0].slug).toBe('dog-1');
  });

  it('should return all categories when search query is empty', () => {
    fixture.detectChanges();

    component.searchQuery.set('xyz-no-match');
    expect(component.filteredCategories().length).toBe(0);

    component.searchQuery.set('');
    expect(component.filteredCategories().length).toBe(2);
  });

  it('should update searchQuery signal when onSearchInput() is called', () => {
    fixture.detectChanges();

    const fakeEvent = { target: { value: 'cat' } } as unknown as Event;
    component.onSearchInput(fakeEvent);

    expect(component.searchQuery()).toBe('cat');
  });

  // ─── Dialog ───────────────────────────────────────────────────────────────────

  it('should open create dialog with a clean empty form', () => {
    fixture.detectChanges();
    component.showDialog();

    expect(component.displayDialog).toBeTrue();
    expect(component.isEditing).toBeFalse();
    expect(component.categoryForm.name).toBe('');
    expect(component.categoryForm.id).toBeUndefined();
    expect(component.selectedFile).toBeNull();
  });

  it('should open edit dialog pre-filled with the selected category data', () => {
    fixture.detectChanges();
    component.editCategory(mockCategories[0]);

    expect(component.displayDialog).toBeTrue();
    expect(component.isEditing).toBeTrue();
    expect(component.categoryForm.name).toBe('Cat 1');
    expect(component.categoryForm.description).toBe('Description 1');
    expect(component.categoryForm.id).toBe('1');
    expect(component.selectedFile).toBeNull();
  });

  it('should close the dialog when hideDialog() is called', () => {
    fixture.detectChanges();
    component.showDialog();
    component.hideDialog();

    expect(component.displayDialog).toBeFalse();
  });

  // ─── Create ───────────────────────────────────────────────────────────────────

  it('should call create() and show success toast when saving a new category', () => {
    fixture.detectChanges();
    component.showDialog();
    component.categoryForm.name = 'New Cat';
    // Component types selectedFile as File | null
    component.selectedFile = new File([''], 'test.png', { type: 'image/png' });

    component.saveCategory();

    expect(categoryServiceMock.create).toHaveBeenCalledOnceWith(
      { name: 'New Cat' },
      component.selectedFile
    );
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
    expect(categoryServiceMock.getAll).toHaveBeenCalledTimes(2);
    expect(component.displayDialog).toBeFalse();
    expect(component.isSaving()).toBeFalse();
  });

  it('should not call create() when no file is selected', () => {
    fixture.detectChanges();
    component.showDialog();
    component.categoryForm.name = 'New Cat';
    component.selectedFile = null;

    component.saveCategory();

    expect(categoryServiceMock.create).not.toHaveBeenCalled();
  });

  it('should show an error toast and stop loading if create() fails', () => {
    categoryServiceMock.create.and.returnValue(throwError(() => new Error('Create failed')));
    fixture.detectChanges();

    component.showDialog();
    component.categoryForm.name = 'Fail Cat';
    component.selectedFile = new File([''], 'fail.png', { type: 'image/png' });

    component.saveCategory();

    expect(component.isLoading()).toBeFalse();
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' })
    );
  });

  // ─── Update ───────────────────────────────────────────────────────────────────

  it('should call update() with correct args and show success toast when editing', () => {
    fixture.detectChanges();
    component.editCategory(mockCategories[0]);
    component.categoryForm.name = 'Updated Cat';
    // No new file → component does: this.selectedFile || undefined → passes undefined

    component.saveCategory();

    expect(categoryServiceMock.update).toHaveBeenCalledOnceWith(
      '1',
      { name: 'Updated Cat' },
      undefined
    );
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
    expect(categoryServiceMock.getAll).toHaveBeenCalledTimes(2);
    expect(component.displayDialog).toBeFalse();
    expect(component.isSaving()).toBeFalse();
  });

  it('should pass the new file to update() when a replacement file is selected', () => {
    fixture.detectChanges();
    component.editCategory(mockCategories[0]);
    component.categoryForm.name = 'Updated Cat';
    const newFile = new File(['img'], 'new.png', { type: 'image/png' });
    component.selectedFile = newFile;

    component.saveCategory();

    expect(categoryServiceMock.update).toHaveBeenCalledOnceWith(
      '1',
      { name: 'Updated Cat' },
      newFile
    );
  });

  it('should show an error toast and stop loading if update() fails', () => {
    categoryServiceMock.update.and.returnValue(throwError(() => new Error('Update failed')));
    fixture.detectChanges();

    component.editCategory(mockCategories[0]);
    component.categoryForm.name = 'Fail Update';

    component.saveCategory();

    expect(component.isLoading()).toBeFalse();
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' })
    );
  });

  // ─── Delete ───────────────────────────────────────────────────────────────────

  it('should call delete() with the correct id and show success toast after confirmation', () => {
    fixture.detectChanges();
    component.deleteCategory(mockCategories[0]);

    expect(confirmationServiceMock.confirm).toHaveBeenCalledTimes(1);
    expect(categoryServiceMock.delete).toHaveBeenCalledOnceWith('1');
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'success' })
    );
    // loadCategories() called after success → init + after delete = 2
    expect(categoryServiceMock.getAll).toHaveBeenCalledTimes(2);
  });

  it('should NOT call delete() if the user rejects the confirmation', () => {
    confirmationServiceMock.confirm.and.callFake((config: Confirmation) => {
      config.reject?.();
      return confirmationServiceMock;
    });

    fixture.detectChanges();
    component.deleteCategory(mockCategories[0]);

    expect(categoryServiceMock.delete).not.toHaveBeenCalled();
    expect(messageServiceMock.add).not.toHaveBeenCalled();
  });

  it('should show an error toast and stop loading if delete() fails', () => {
    categoryServiceMock.delete.and.returnValue(throwError(() => new Error('Delete failed')));
    fixture.detectChanges();

    component.deleteCategory(mockCategories[0]);

    expect(component.isLoading()).toBeFalse();
    expect(messageServiceMock.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' })
    );
  });

  // ─── File Selection ───────────────────────────────────────────────────────────

  it('should set selectedFile when onFileSelect() is called', () => {
    fixture.detectChanges();
    const file = new File(['img'], 'photo.png', { type: 'image/png' });

    component.onFileSelect({ files: [file] });

    expect(component.selectedFile).toBe(file);
  });
});
