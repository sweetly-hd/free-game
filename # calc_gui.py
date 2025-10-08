# calc_gui.py
# Calculator GUI đơn giản với tkinter. Hỗ trợ nhập bằng chuột hoặc bàn phím.

import tkinter as tk
from tkinter import ttk
import math
import ast, operator

# Sử dụng cùng logic safe_eval như ở trên (để tránh eval trực tiếp)
OPERATORS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
    ast.Mod: operator.mod,
    ast.USub: operator.neg,
    ast.UAdd: operator.pos,
}
SAFE_FUNCS = {'sqrt': math.sqrt, 'sin': math.sin, 'cos': math.cos, 'tan': math.tan, 'log': math.log, 'ln': math.log, 'abs': abs, 'pow': pow}

def safe_eval(expr: str):
    node = ast.parse(expr, mode='eval')
    def _eval(n):
        if isinstance(n, ast.Expression): return _eval(n.body)
        if isinstance(n, ast.Constant):
            if isinstance(n.value, (int, float)): return n.value
            raise ValueError("Không chấp nhận hằng không phải số.")
        if isinstance(n, ast.Num): return n.n
        if isinstance(n, ast.BinOp):
            left = _eval(n.left); right = _eval(n.right)
            op_type = type(n.op)
            if op_type in OPERATORS: return OPERATORS[op_type](left, right)
            raise ValueError("Toán tử không được hỗ trợ.")
        if isinstance(n, ast.UnaryOp):
            operand = _eval(n.operand); op_type = type(n.op)
            if op_type in OPERATORS: return OPERATORS[op_type](operand)
            raise ValueError("Toán tử đơn không được hỗ trợ.")
        if isinstance(n, ast.Call):
            if not isinstance(n.func, ast.Name): raise ValueError("Gọi hàm không hợp lệ.")
            fname = n.func.id
            if fname not in SAFE_FUNCS: raise ValueError(f"Hàm '{fname}' không được phép.")
            args = [_eval(a) for a in n.args]
            return SAFE_FUNCS[fname](*args)
        if isinstance(n, ast.Name):
            if n.id == 'pi': return math.pi
            if n.id == 'e': return math.e
            raise ValueError(f"Tên '{n.id}' không được phép.")
        raise ValueError("Thành phần không hợp lệ.")
    return _eval(node)

class Calculator(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("Calculator")
        self.geometry("320x420")
        self.resizable(False, False)

        self.entry = ttk.Entry(self, font=("Arial", 18), justify='right')
        self.entry.pack(fill='x', padx=8, pady=8, ipady=8)

        btns = [
            ['7','8','9','/'],
            ['4','5','6','*'],
            ['1','2','3','-'],
            ['0','.','%','+'],
            ['(',')','**','^'],
            ['sqrt','pow','C','=']
        ]

        frame = ttk.Frame(self)
        frame.pack(expand=True, fill='both', padx=8, pady=8)

        for r, row in enumerate(btns):
            for c, label in enumerate(row):
                b = ttk.Button(frame, text=label, command=lambda l=label: self.on_click(l))
                b.grid(row=r, column=c, sticky='nsew', padx=4, pady=4)
        for i in range(4):
            frame.columnconfigure(i, weight=1)
        for i in range(len(btns)):
            frame.rowconfigure(i, weight=1)

        # binding keyboard
        self.bind("<Return>", lambda e: self.on_click('='))
        self.bind("<Escape>", lambda e: self.on_click('C'))

    def on_click(self, label):
        cur = self.entry.get()
        if label == 'C':
            self.entry.delete(0, tk.END)
            return
        if label == '=':
            expr = cur.replace('^', '**')  # hỗ trợ ^ như lũy thừa thông dụng
            try:
                result = safe_eval(expr)
                self.entry.delete(0, tk.END)
                self.entry.insert(0, str(result))
            except Exception as e:
                self.entry.delete(0, tk.END)
                self.entry.insert(0, "Lỗi")
            return
        # nếu nhấn pow thì chèn pow(
        if label == 'pow':
            self.entry.insert(tk.END, 'pow(')
            return
        if label == 'sqrt':
            self.entry.insert(tk.END, 'sqrt(')
            return
        self.entry.insert(tk.END, label)

if __name__ == "__main__":
    app = Calculator()
    app.mainloop()
