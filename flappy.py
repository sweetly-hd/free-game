import pygame
import sys
import random

# Tùy chọn: nếu muốn âm thanh tốt hơn, cài numpy (pip install numpy)
try:
    import numpy as np
    _HAS_NUMPY = True
except Exception:
    _HAS_NUMPY = False

pygame.init()

# Thử khởi tạo âm thanh; nếu lỗi thì tắt âm thanh
_audio_enabled = True
try:
    pygame.mixer.init(frequency=44100, size=-16, channels=2, buffer=512)
except Exception as e:
    print("Warning: audio disabled (mixer init failed):", e)
    _audio_enabled = False

# Tạo âm thanh nhảy nếu có numpy và mixer OK
if _audio_enabled and _HAS_NUMPY:
    freq = 700  # Hz
    duration_ms = 80
    sample_rate = 44100
    n_samples = int(sample_rate * duration_ms / 1000)
    t = np.linspace(0, duration_ms / 1000, n_samples, False)
    tone = 0.5 * np.sin(2 * np.pi * freq * t)
    audio = np.int16(tone * 32767)
    stereo = np.column_stack((audio, audio))  # stereo
    try:
        flap_sound = pygame.sndarray.make_sound(stereo)
    except Exception as e:
        print("Warning: cannot create sound from array:", e)
        flap_sound = None

    def play_flap_sound():
        try:
            if flap_sound:
                flap_sound.play()
        except Exception:
            pass
else:
    # Nếu không tạo được sound thì hàm rỗng — không gây lỗi
    def play_flap_sound():
        pass

# Màn hình
WIDTH, HEIGHT = 1920, 1080
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Flappy Bird Python (Simplified)")

# Màu
WHITE = (255, 255, 255)
BLUE = (0, 155, 255)
GREEN = (0, 200, 0)
YELLOW = (255, 255, 0)
RED = (255, 50, 50)
GRAY = (130, 130, 130)

clock = pygame.time.Clock()
FPS = 60

# Thông số game
gravity = 0.5
flap_strength = -8
pipe_width = 60
pipe_gap = 150
pipe_speed = 3
bird_radius = 15

font = pygame.font.SysFont("arial", 30, bold=True)
big_font = pygame.font.SysFont("arial", 56, bold=True)

def reset_game():
    return {
        "bird_x": 80,
        "bird_y": HEIGHT // 2,
        "bird_velocity": 0,
        "pipes": [],
        "score": 0
    }

def draw_bird(x, y):
    pygame.draw.circle(screen, YELLOW, (int(x), int(y)), bird_radius)
    pygame.draw.circle(screen, RED, (int(x + 5), int(y - 5)), 4)  # mắt

def create_pipe():
    min_y = 80
    max_y = HEIGHT - pipe_gap - 80
    y_top = random.randint(min_y, max_y)
    return {"x": WIDTH, "y_top": y_top}

def draw_pipe(pipe):
    pygame.draw.rect(screen, GREEN, (pipe["x"], 0, pipe_width, pipe["y_top"]))
    pygame.draw.rect(screen, GREEN, (pipe["x"], pipe["y_top"] + pipe_gap, pipe_width, HEIGHT - (pipe["y_top"] + pipe_gap)))

def check_collision(pipe, bird_x, bird_y):
    # chạm trần hoặc sàn
    if bird_y - bird_radius <= 0 or bird_y + bird_radius >= HEIGHT:
        return True
    # chạm ống
    if pipe["x"] < bird_x < pipe["x"] + pipe_width:
        if bird_y - bird_radius < pipe["y_top"] or bird_y + bird_radius > pipe["y_top"] + pipe_gap:
            return True
    return False

def show_game_over(score):
    screen.fill(BLUE)
    over_text = big_font.render("GAME OVER", True, RED)
    screen.blit(over_text, (WIDTH // 2 - over_text.get_width() // 2, HEIGHT // 2 - 110))

    score_text = font.render(f"Điểm: {score}", True, WHITE)
    screen.blit(score_text, (WIDTH // 2 - score_text.get_width() // 2, HEIGHT // 2 - 40))

    restart_rect = pygame.Rect(WIDTH // 2 - 100, HEIGHT // 2 + 10, 200, 60)
    pygame.draw.rect(screen, GRAY, restart_rect, border_radius=10)
    restart_text = font.render("RESTART", True, WHITE)
    screen.blit(restart_text, (restart_rect.centerx - restart_text.get_width() // 2, restart_rect.centery - restart_text.get_height() // 2))

    pygame.display.flip()
    return restart_rect

def main():
    state = reset_game()
    running = True
    game_over = False
    restart_button = None

    while running:
        # Nếu đang trong trạng thái game over, vẽ màn hình Game Over trước khi xử lý sự kiện
        if game_over:
            restart_button = show_game_over(state["score"])

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()

            if not game_over:
                if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
                    state["bird_velocity"] = flap_strength
                    play_flap_sound()
            else:
                # khi game over: space hoặc click vào nút restart -> reset
                if event.type == pygame.KEYDOWN and event.key == pygame.K_SPACE:
                    state = reset_game()
                    game_over = False
                if event.type == pygame.MOUSEBUTTONDOWN:
                    if restart_button and restart_button.collidepoint(event.pos):
                        state = reset_game()
                        game_over = False

        if not game_over:
            screen.fill(BLUE)

            # cập nhật chim
            state["bird_velocity"] += gravity
            state["bird_y"] += state["bird_velocity"]

            # tạo ống mới
            if len(state["pipes"]) == 0 or state["pipes"][-1]["x"] < WIDTH - 200:
                state["pipes"].append(create_pipe())

            # cập nhật và vẽ ống
            for pipe in state["pipes"]:
                pipe["x"] -= pipe_speed
                draw_pipe(pipe)
                if check_collision(pipe, state["bird_x"], state["bird_y"]):
                    game_over = True

            # xóa ống ra khỏi màn hình và tăng điểm
            if state["pipes"] and state["pipes"][0]["x"] + pipe_width < 0:
                state["pipes"].pop(0)
                state["score"] += 1

            # vẽ chim và điểm
            draw_bird(state["bird_x"], state["bird_y"])
            score_text = font.render(f"Score: {state['score']}", True, WHITE)
            screen.blit(score_text, (10, 10))

            pygame.display.flip()
            clock.tick(FPS)
        else:
            # game over: giữ chậm lại để giảm CPU
            clock.tick(15)

if __name__ == "__main__":
    main()
