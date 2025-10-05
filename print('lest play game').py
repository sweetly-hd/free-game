# snake_game.py
# Game: Rắn săn mồi (Snake) - Python + pygame
# Lưu file này bằng UTF-8. Chạy: python snake_game.py
# Cài pygame nếu chưa có: pip install pygame

import pygame
import random
import sys

pygame.init()

# --- Cấu hình ---
WIDTH, HEIGHT = 640, 480
CELL_SIZE = 20
COLUMNS = WIDTH // CELL_SIZE
ROWS = HEIGHT // CELL_SIZE
FPS_START = 15  # tăng tốc độ ban đầu để phản hồi nhanh hơn
FPS_INCREMENT = 0.7  # tăng tốc nhanh hơn mỗi khi ăn mồi

# Màu sắc (RGB)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (200, 30, 30)
GREEN = (40, 180, 40)
DARK_GREEN = (20, 120, 20)
GRAY = (80, 80, 80)

# Font
FONT_SMALL = pygame.font.SysFont(None, 24)
FONT_BIG = pygame.font.SysFont(None, 48)

# Khởi tạo cửa sổ
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption('Rắn săn mồi - Snake')
clock = pygame.time.Clock()


def draw_text(surface, text, font, color, pos):
    img = font.render(text, True, color)
    surface.blit(img, pos)


class Snake:
    def __init__(self):
        self.positions = [(COLUMNS // 2, ROWS // 2),
                          (COLUMNS // 2 - 1, ROWS // 2),
                          (COLUMNS // 2 - 2, ROWS // 2)]
        self.direction = (1, 0)
        self.next_direction = (1, 0)
        self.grow_pending = 0

    def head(self):
        return self.positions[0]

    def move(self):
        self.direction = self.next_direction  # áp dụng hướng mới sớm hơn để giảm delay
        dx, dy = self.direction
        head_x, head_y = self.head()
        new_head = ((head_x + dx) % COLUMNS, (head_y + dy) % ROWS)
        self.positions.insert(0, new_head)
        if self.grow_pending > 0:
            self.grow_pending -= 1
        else:
            self.positions.pop()

    def change_direction(self, new_dir):
        if (new_dir[0] * -1, new_dir[1] * -1) != self.direction:
            self.next_direction = new_dir

    def grow(self, amount=1):
        self.grow_pending += amount

    def collides_with_self(self):
        return self.head() in self.positions[1:]


class Food:
    def __init__(self, snake_positions):
        self.position = self.random_pos(snake_positions)

    def random_pos(self, snake_positions):
        choices = [(x, y) for x in range(COLUMNS) for y in range(ROWS) if (x, y) not in snake_positions]
        return random.choice(choices) if choices else None

    def respawn(self, snake_positions):
        self.position = self.random_pos(snake_positions)


class Game:
    def __init__(self):
        self.snake = Snake()
        self.food = Food(self.snake.positions)
        self.score = 0
        self.fps = FPS_START
        self.running = True
        self.paused = False

    def reset(self):
        self.__init__()

    def update(self):
        if self.paused or not self.running:
            return

        self.snake.move()

        if self.snake.collides_with_self():
            self.running = False
            return

        if self.snake.head() == self.food.position:
            self.score += 1
            self.snake.grow(1)
            self.food.respawn(self.snake.positions)
            self.fps += FPS_INCREMENT

        if self.food.position is None:
            self.running = False

    def handle_event(self, event):
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_UP:
                self.snake.change_direction((0, -1))
            elif event.key == pygame.K_DOWN:
                self.snake.change_direction((0, 1))
            elif event.key == pygame.K_LEFT:
                self.snake.change_direction((-1, 0))
            elif event.key == pygame.K_RIGHT:
                self.snake.change_direction((1, 0))
            elif event.key == pygame.K_p:
                self.paused = not self.paused
            elif event.key == pygame.K_r:
                self.reset()
            elif event.key == pygame.K_ESCAPE:
                pygame.quit()
                sys.exit()

    def draw_grid(self):
        for x in range(0, WIDTH, CELL_SIZE):
            pygame.draw.line(screen, GRAY, (x, 0), (x, HEIGHT))
        for y in range(0, HEIGHT, CELL_SIZE):
            pygame.draw.line(screen, GRAY, (0, y), (WIDTH, y))

    def draw(self):
        screen.fill(BLACK)
        self.draw_grid()

        if self.food.position:
            fx, fy = self.food.position
            rect = pygame.Rect(fx * CELL_SIZE, fy * CELL_SIZE, CELL_SIZE, CELL_SIZE)
            pygame.draw.rect(screen, RED, rect)

        for i, (x, y) in enumerate(self.snake.positions):
            rect = pygame.Rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE)
            if i == 0:
                pygame.draw.rect(screen, WHITE, rect)
                inner = rect.inflate(-6, -6)
                pygame.draw.rect(screen, DARK_GREEN, inner)
            else:
                pygame.draw.rect(screen, GREEN, rect)
                inner = rect.inflate(-6, -6)
                pygame.draw.rect(screen, BLACK, inner)

        draw_text(screen, f"Điểm: {self.score}", FONT_SMALL, WHITE, (8, 8))
        draw_text(screen, f"Tốc độ: {self.fps:.1f}", FONT_SMALL, WHITE, (8, 30))

        if self.paused:
            draw_text(screen, "PAUSED - Nhấn 'P' để tiếp tục", FONT_BIG, WHITE, (WIDTH // 6, HEIGHT // 2 - 40))
        if not self.running:
            msg = "Bạn thua! (Rắn tự cắn hoặc hết chỗ cho mồi)"
            draw_text(screen, msg, FONT_BIG, RED, (20, HEIGHT // 2 - 40))
            draw_text(screen, "Nhấn R để chơi lại, ESC để thoát", FONT_SMALL, WHITE, (WIDTH // 4, HEIGHT // 2 + 20))

        pygame.display.flip()


def main_loop():
    game = Game()
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            game.handle_event(event)

        game.update()
        game.draw()

        clock.tick(game.fps)


if __name__ == '__main__':
    main_loop()
