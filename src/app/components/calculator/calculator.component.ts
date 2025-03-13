import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlotlyModule } from 'angular-plotly.js';
import * as PlotlyJS from 'plotly.js-dist-min';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VisualizationComponent } from '../visualization/visualization.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-calculator',
  imports: [CommonModule, FormsModule, PlotlyModule, FontAwesomeModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
  standalone: true
})
export class CalculatorComponent {
  constructor(private apiService: ApiService, private visualComponent: VisualizationComponent,private router: Router) {}

  functionInput: string = '';
  displayExpression: string = '';
  currentTab: string = 'numbers';

  //numbers: string[] = ['7', '8', '9','×', '÷', '4', '5', '6', '+', '-', '1', '2', '3', '⌫', '0', '(', ')','i','↵'];
  numbers = [
    { symbol: '7', display: '7' },
    { symbol: '8', display: '8' },
    { symbol: '9', display: '9' },
    { symbol: '·', display: '·' },
    { symbol: '÷', display: '/' },
    { symbol: '4', display: '4' },
    { symbol: '5', display: '5' },
    { symbol: '6', display: '6' },
    { symbol: '+', display: '+' },
    { symbol: '-', display: '-' },
    { symbol: '1', display: '1' },
    { symbol: '2', display: '2' },
    { symbol: '3', display: '3' },
    { symbol: '⌫', display: '⌫' },
    { symbol: '0', display: '0' },
    { symbol: '(', display: '(' },
    { symbol: ')', display: ')' },
    { symbol: '↵', display: '↵' }
  ];
  functions = [
    { symbol: 'sin', display: 'sen' },
    { symbol: 'cos', display: 'cos' },
    { symbol: 'tan', display: 'tg' },
    { symbol: 'log', display: 'log' },
    { symbol: 'ln', display: 'ln' },
    { symbol: 'exp', display: 'e^x' },
    { symbol: '∫', display: '∫' },
    { symbol: '∂', display: '∂' },
    { symbol: 'Γ', display: 'Γ' }
  ];
  symbols: string[] = ['𝑥', '𝑦','𝑧','𝜋', '𝑒'];//, '<', '>', '{', '}', '≤', '≥'];

  setTab(tab: string) {
    this.currentTab = tab;
  }

  addSymbol(symbol: string) {
    if (symbol === '⌫') {
      this.deleteLastCharacter();
    }else if(symbol === '↵')
    {
      this.sendFunction();
    }
     else {
      this.displayExpression += symbol;
      this.functionInput += symbol; // Se actualiza functionInput también
    }
  }
  

  deleteLastCharacter() {
    this.displayExpression = this.displayExpression.trimEnd().slice(0, -1);
    this.functionInput = this.functionInput.slice(0, -1); // Se sincroniza con functionInput
  }

  clearInput() {
    this.functionInput = '';
    this.displayExpression = '';
  }
  public limpiarCadena(input: string): string {
    // Eliminar espacios y asegurar el formato ax+biy
    return input.replace(/\s+/g, '').replace(/%2B/g, '+'); // Elimina todos los espacios
  }

  sendFunction()
  {
    this.displayExpression = this.limpiarCadena(this.displayExpression);
    this.visualComponent.sendFunction(this.displayExpression);
  }
}
