import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Annotation, CameraMode } from '../../app';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  // Input properties from parent component
  @Input() annotations: Annotation[] = [];
  @Input() showAnnotations: boolean = true;
  @Input() timeOfDay: number = 12;
  @Input() nightLightsEnabled: boolean = true;
  @Input() isNight: boolean = false;
  @Input() cameraMode: CameraMode = 'orbit';

  // Output events to parent component
  @Output() editAnnotation = new EventEmitter<{id: string, title: string, description: string}>();
  @Output() deleteAnnotation = new EventEmitter<string>();
  @Output() toggleAnnotations = new EventEmitter<void>();
  @Output() timeOfDayChange = new EventEmitter<number>();
  @Output() nightLightsToggle = new EventEmitter<void>();
  @Output() modelUpload = new EventEmitter<File>();
  @Output() cameraModeChange = new EventEmitter<CameraMode>();

  // Local state
  editingAnnotation: string | null = null;
  editingTitle: string = '';
  editingDescription: string = '';

  // Format time for display
  get formattedTime(): string {
    return `${this.timeOfDay.toString().padStart(2, '0')}:00`;
  }

  // Handle file upload
  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file && (file.name.toLowerCase().endsWith('.obj') || file.name.toLowerCase().endsWith('.fbx'))) {
      this.modelUpload.emit(file);
    }
  }

  // Handle time of day slider change
  onTimeChange(event: any) {
    this.timeOfDayChange.emit(Number(event.target.value));
  }

  // Handle camera mode change
  onCameraModeChange(event: any) {
    this.cameraModeChange.emit(event.target.value as CameraMode);
  }

  // Start editing annotation
  startEditAnnotation(annotation: Annotation) {
    this.editingAnnotation = annotation.id;
    this.editingTitle = annotation.title;
    this.editingDescription = annotation.description;
  }

  // Save annotation edits
  saveAnnotation() {
    if (this.editingAnnotation) {
      this.editAnnotation.emit({
        id: this.editingAnnotation,
        title: this.editingTitle,
        description: this.editingDescription
      });
      this.cancelEditAnnotation();
    }
  }

  // Cancel annotation editing
  cancelEditAnnotation() {
    this.editingAnnotation = null;
    this.editingTitle = '';
    this.editingDescription = '';
  }

  // Delete annotation
  onDeleteAnnotation(id: string) {
    this.deleteAnnotation.emit(id);
  }

  // Toggle annotations visibility
  onToggleAnnotations() {
    this.toggleAnnotations.emit();
  }

  // Toggle night lights
  onNightLightsToggle() {
    this.nightLightsToggle.emit();
  }

  // Reset camera (placeholder - implement in parent)
  resetCamera() {
    // This would emit an event to reset camera position
    console.log('Reset camera requested');
  }
} 