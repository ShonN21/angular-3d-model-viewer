import { Component, signal } from '@angular/core';
import { ModelViewerComponent } from './components/model-viewer/model-viewer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

// Interface for 3D annotations
export interface Annotation {
  id: string;
  position: [number, number, number];
  title: string;
  description: string;
}

// Camera modes type
export type CameraMode = 'orbit' | 'firstPerson';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ModelViewerComponent, SidebarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'angular-3d-model-viewer';

  // State management using Angular signals
  annotations = signal<Annotation[]>([]);
  showAnnotations = signal(true);
  timeOfDay = signal(12); // 0-24 hours
  nightLightsEnabled = signal(true);
  modelFile = signal<File | null>(null);
  cameraMode = signal<CameraMode>('orbit');

  // Computed properties
  get isNight(): boolean {
    return this.timeOfDay() >= 20 || this.timeOfDay() < 6;
  }

  // Event handlers for annotation management
  onEditAnnotation(id: string, title: string, description: string) {
    this.annotations.update(annotations => 
      annotations.map(ann => 
        ann.id === id ? { ...ann, title, description } : ann
      )
    );
  }

  onDeleteAnnotation(id: string) {
    this.annotations.update(annotations => 
      annotations.filter(ann => ann.id !== id)
    );
  }

  onAddAnnotation(annotation: Annotation) {
    this.annotations.update(annotations => [...annotations, annotation]);
  }

  // Event handlers for file upload
  onModelUpload(file: File) {
    this.modelFile.set(file);
  }

  // Event handlers for settings
  onToggleAnnotations() {
    this.showAnnotations.update(show => !show);
  }

  onTimeOfDayChange(time: number) {
    this.timeOfDay.set(time);
  }

  onNightLightsToggle() {
    this.nightLightsEnabled.update(enabled => !enabled);
  }

  onCameraModeChange(mode: CameraMode) {
    this.cameraMode.set(mode);
  }
} 