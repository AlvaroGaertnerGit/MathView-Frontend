import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VisualizationComponent } from '../visualization/visualization.component';

@Component({
  selector: 'app-calculator',
  imports: [CommonModule, FormsModule],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
  standalone: true
})
export class CalculatorComponent {
  constructor(private visualComponent: VisualizationComponent) { }

  /** Names read by assistive tech for keys whose glyph is not self-explanatory. */
  readonly keyLabels: Record<string, string> = {
    '·': 'Multiplicar', '/': 'Dividir', '⌫': 'Borrar', '↵': 'Representar',
    '∫': 'Integral', '∂': 'Derivada parcial', 'Γ': 'Función gamma',
    '𝑥': 'x', '𝑦': 'y', '𝑧': 'z', '𝜋': 'pi', '𝑒': 'e',
  };
  readonly tabs = [
    { id: 'numbers', label: 'Números' },
    { id: 'functions', label: 'Funciones' },
    { id: 'symbols', label: 'Símbolos' },
  ];

  functionInput: string = '';
  displayExpression: string = '';
  currentTab: string = 'numbers';

  //numbers: string[] = ['7', '8', '9','×', '÷', '4', '5', '6', '+', '-', '1', '2', '3', '⌫', '0', '(', ')','i','↵'];
  numbers = [
    // Primera fila: 7, 8, 9, *, /
    { symbol: '7', display: '7' },
    { symbol: '8', display: '8' },
    { symbol: '9', display: '9' },
    { symbol: '·', display: '·' },
    { symbol: '/', display: '/' }, // was '÷', which the API cannot parse (400); '/' is what it reads

    // Segunda fila: 4, 5, 6, +, -
    { symbol: '4', display: '4' },
    { symbol: '5', display: '5' },
    { symbol: '6', display: '6' },
    { symbol: '+', display: '+' },
    { symbol: '-', display: '-' },

    // Tercera fila: 1, 2, 3, (, )
    { symbol: '1', display: '1' },
    { symbol: '2', display: '2' },
    { symbol: '3', display: '3' },
    { symbol: '(', display: '(' },
    { symbol: ')', display: ')' },

    // Cuarta fila: 0, ., borrar, enter
    { symbol: '0', display: '0' },
    { symbol: '.', display: '.' },
    { symbol: '⌫', display: '⌫' },
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
  symbols: string[] = ['𝑥', '𝑦', '𝑧', '𝜋', '𝑒'];//, '<', '>', '{', '}', '≤', '≥'];

  setTab(tab: string) {
    this.currentTab = tab;
  }

  addSymbol(symbol: string) {
    if (symbol === '⌫') {
      this.deleteLastCharacter();
    } else if (symbol === '↵') {
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

  sendFunction() {
    this.displayExpression = this.limpiarCadena(this.displayExpression);
    this.visualComponent.sendFunction(this.displayExpression);
  }
}
