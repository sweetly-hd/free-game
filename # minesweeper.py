# minesweeper.py
# Simple Minesweeper using pygame
# Run: pip install pygame
# Then: python minesweeper.py

import pygame
import sys
import random
from collections import deque

# ----------------- CONFIG -----------------
CELL_SIZE = 28         # pixel size of each cell
GRID_W = 16            # number of columns
GRID_H = 16            # number of rows
MINES = 40             # number of mines
FPS = 60
WINDOW_PADDING = 20
FONT_NAME = None       # None -> default pygame font
# ------------------------------------------

# Colors (RGB)
BG = (200, 200, 200)
GRID_BG = (160, 160, 160)
CELL_COVER = (120, 120, 120)
CELL_OPEN = (230, 230, 230)
FLAG_COLOR = (200, 50, 50)
MINE_COLOR = (0, 0, 0)
TEXT_COLOR = (10, 10, 10)
NUM_COLORS = {
    1: (0, 0, 200),
    2: (0, 140, 0),
    3: (200, 0, 0),
    4: (0, 0, 120),
    5: (120, 0, 0),
    6: (0, 120, 120),
    7: (0, 0, 0),
    8: (80, 80, 80),
}

pygame.init()
CLOCK = pygame.time.Clock()
FONT = pygame.font.SysFont(FONT_NAME, 18)
SMALL_FONT = pygame.font.SysFont(FONT_NAME, 14)

WIDTH = GRID_W * CELL_SIZE + WINDOW_PADDING * 2
HEIGHT = GRID_H * CELL_SIZE + 100  # extra for info area

SCREEN = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Minesweeper - Python (Pygame)")

# ----------------- Game logic classes -----------------
class Cell:
    def __init__(self):
        self.mine = False
        self.open = False
        self.flag = False
        self.adj = 0

class Board:
    def __init__(self, w, h, mines):
        self.w = w
        self.h = h
        self.mines = mines
        self.first_click = True
        self.cells = [[Cell() for _ in range(w)] for _ in range(h)]
        self.opened_count = 0
        self.game_over = False
        self.win = False
        self.start_time = None
        self.elapsed = 0

    def in_bounds(self, r, c):
        return 0 <= r < self.h and 0 <= c < self.w

    def neighbors(self, r, c):
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                if dr == 0 and dc == 0:
                    continue
                rr, cc = r + dr, c + dc
                if self.in_bounds(rr, cc):
                    yield rr, cc

    def place_mines(self, safe_r, safe_c):
        # ensure first click (safe_r, safe_c) and its neighbors are safe
        positions = [(r, c) for r in range(self.h) for c in range(self.w)]
        banned = set((safe_r + dr, safe_c + dc)
                     for dr in (-1, 0, 1)
                     for dc in (-1, 0, 1)
                     if self.in_bounds(safe_r + dr, safe_c + dc))
        candidates = [p for p in positions if p not in banned]
        random.shuffle(candidates)
        for i in range(self.mines):
            r, c = candidates[i]
            self.cells[r][c].mine = True

        # compute adjacency counts
        for r in range(self.h):
            for c in range(self.w):
                if self.cells[r][c].mine:
                    continue
                count = 0
                for rr, cc in self.neighbors(r, c):
                    if self.cells[rr][cc].mine:
                        count += 1
                self.cells[r][c].adj = count

    def reveal(self, r, c):
        if self.game_over:
            return
        if not self.in_bounds(r, c):
            return
        cell = self.cells[r][c]
        if cell.open or cell.flag:
            return

        # on first click, set up mines so (r,c) safe
        if self.first_click:
            self.place_mines(r, c)
            self.first_click = False
            self.start_time = pygame.time.get_ticks()

        # if it's a mine -> game over
        if cell.mine:
            cell.open = True
            self.reveal_all_mines()
            self.game_over = True
            self.win = False
            return

        # flood fill for zeros
        to_visit = deque()
        to_visit.append((r, c))
        while to_visit:
            rr, cc = to_visit.popleft()
            ccell = self.cells[rr][cc]
            if ccell.open or ccell.flag:
                continue
            ccell.open = True
            self.opened_count += 1
            if ccell.adj == 0:
                for nr, nc in self.neighbors(rr, cc):
                    if not self.cells[nr][nc].open and not self.cells[nr][nc].mine:
                        to_visit.append((nr, nc))

        # check win: opened cells == total - mines
        total_cells = self.w * self.h
        if self.opened_count == total_cells - self.mines:
            self.game_over = True
            self.win = True
            # reveal flags for display
            for r0 in range(self.h):
                for c0 in range(self.w):
                    if self.cells[r0][c0].mine:
                        self.cells[r0][c0].flag = True

    def reveal_all_mines(self):
        for r in range(self.h):
            for c in range(self.w):
                if self.cells[r][c].mine:
                    self.cells[r][c].open = True

    def toggle_flag(self, r, c):
        if self.game_over:
            return
        if not self.in_bounds(r, c):
            return
        cell = self.cells[r][c]
        if cell.open:
            return
        cell.flag = not cell.flag

    def chord(self, r, c):
        """If number cell and number of adjacent flags equals number,
           reveal neighbors (useful for faster play)."""
        if not self.in_bounds(r, c):
            return
        cell = self.cells[r][c]
        if not cell.open or cell.adj == 0:
            return
        flags = 0
        for rr, cc in self.neighbors(r, c):
            if self.cells[rr][cc].flag:
                flags += 1
        if flags == cell.adj:
            for rr, cc in self.neighbors(r, c):
                if not self.cells[rr][cc].flag and not self.cells[rr][cc].open:
                    self.reveal(rr, cc)

    def flagged_count(self):
        cnt = 0
        for r in range(self.h):
            for c in range(self.w):
                if self.cells[r][c].flag:
                    cnt += 1
        return cnt

    def update_time(self):
        if self.start_time and not self.game_over:
            self.elapsed = (pygame.time.get_ticks() - self.start_time) // 1000

    def reset(self):
        self.__init__(self.w, self.h, self.mines)


# ----------------- Drawing -----------------
def draw_board(board):
    SCREEN.fill(BG)
    # Info panel
    pygame.draw.rect(SCREEN, GRID_BG, (0, 0, WIDTH, 60))
    mines_left = max(0, board.mines - board.flagged_count())
    txt_mines = FONT.render(f"Mines: {mines_left}", True, TEXT_COLOR)
    txt_time = FONT.render(f"Time: {board.elapsed}s", True, TEXT_COLOR)
    SCREEN.blit(txt_mines, (20, 18))
    SCREEN.blit(txt_time, (WIDTH - 120, 18))

    # Message if game over
    if board.game_over:
        if board.win:
            msg = "You Win! Press R to restart."
        else:
            msg = "Boom! You Lose. Press R to restart."
        txt = FONT.render(msg, True, TEXT_COLOR)
        SCREEN.blit(txt, (WIDTH // 2 - txt.get_width() // 2, 18))

    # grid
    grid_x = WINDOW_PADDING
    grid_y = 80
    for r in range(board.h):
        for c in range(board.w):
            x = grid_x + c * CELL_SIZE
            y = grid_y + r * CELL_SIZE
            cell = board.cells[r][c]

            rect = pygame.Rect(x, y, CELL_SIZE, CELL_SIZE)
            pygame.draw.rect(SCREEN, (100, 100, 100), rect, 1)  # border

            if cell.open:
                pygame.draw.rect(SCREEN, CELL_OPEN, rect)
                if cell.mine:
                    pygame.draw.circle(SCREEN, MINE_COLOR, rect.center, CELL_SIZE // 3)
                elif cell.adj > 0:
                    color = NUM_COLORS.get(cell.adj, TEXT_COLOR)
                    num_s = FONT.render(str(cell.adj), True, color)
                    SCREEN.blit(num_s, (x + CELL_SIZE // 2 - num_s.get_width() // 2,
                                        y + CELL_SIZE // 2 - num_s.get_height() // 2))
            else:
                pygame.draw.rect(SCREEN, CELL_COVER, rect)
                if cell.flag:
                    # small flag triangle
                    px = x + CELL_SIZE // 4
                    py = y + CELL_SIZE // 4
                    points = [(px, py + CELL_SIZE // 2), (px, py), (px + CELL_SIZE // 2, py + CELL_SIZE // 3)]
                    pygame.draw.polygon(SCREEN, FLAG_COLOR, points)
                    # flag pole
                    pygame.draw.line(SCREEN, (80, 80, 80), (px, py + CELL_SIZE // 2), (px, py - CELL_SIZE // 4), 2)


# ----------------- Utilities -----------------
def pixel_to_cell(mx, my):
    gx = WINDOW_PADDING
    gy = 80
    if mx < gx or my < gy:
        return None
    cx = (mx - gx) // CELL_SIZE
    cy = (my - gy) // CELL_SIZE
    if 0 <= cx < GRID_W and 0 <= cy < GRID_H:
        return (cy, cx)
    return None

# ----------------- Main loop -----------------
def main():
    board = Board(GRID_W, GRID_H, MINES)
    running = True

    while running:
        CLOCK.tick(FPS)
        board.update_time()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
                break

            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_r:
                    board.reset()

            elif event.type == pygame.MOUSEBUTTONDOWN and not board.game_over:
                pos = pygame.mouse.get_pos()
                cell_coords = pixel_to_cell(*pos)
                if not cell_coords:
                    continue
                r, c = cell_coords
                if event.button == 1:  # left click
                    # if open number and both buttons? we'll support chord with shift-click
                    mods = pygame.key.get_mods()
                    if board.cells[r][c].open and mods & pygame.KMOD_SHIFT:
                        board.chord(r, c)
                    else:
                        board.reveal(r, c)
                elif event.button == 3:  # right click
                    board.toggle_flag(r, c)
                elif event.button == 2:  # middle click -> chord
                    board.chord(r, c)

        draw_board(board)
        pygame.display.flip()

    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()
