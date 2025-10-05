import pygame
import random
import sys
import os


pygame.init()


WIDTH, HEIGHT = 1920, 1080
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Hiệu ứng mưa rơi + sao phát sáng + font tiếng Việt")


BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RAIN_COLOR = (0, 200, 255)


font_path = os.path.join("fonts", "NotoSans-Regular.ttf")
if not os.path.exists(font_path):
    
    font_path = None

font = pygame.font.Font(font_path, 40)
name_font = pygame.font.Font(font_path, 20)


custom_texts = [
    ("trai tim cung biet dau .", 200),
    ("trai tim cung biet dau ..?", 200),
    ("trai trai trai trai tim cung biet dau .", 150),
    ("trai , trai trai tim cung biet dau", 150,500),
    ("trai tim cung biet dau ,",200,150),
    ('co quen di nhung ngay thang doi ta co nhau', 150),
    ('nuoc mat kia cu roi ,',200,100),
    ('trong tim dang gia buot ,',100,10),
    ('khuon mat ra roi .',100,100),
]

user_name = "nhd"

index = 0
words = custom_texts[index][0].split()
typing_speed = custom_texts[index][1]
current_text = ""
word_index = 0
last_word_time = pygame.time.get_ticks()
finished_typing = False
delay_after_finish = 100

RAINBOW_COLORS = [
    (255, 0, 0), (255, 127, 0), (255, 255, 0),
    (0, 255, 0), (0, 0, 255), (75, 0, 130),
    (148, 0, 211)
]
color_index = 0
next_color_index = 1
transition_progress = 0.0
transition_speed = 0.01

class Raindrop:
    def __init__(self):
        self.x = random.randint(0, WIDTH)
        self.y = random.randint(-HEIGHT, 0)
        self.length = random.randint(15, 30)  # vệt mưa dài hơn
        self.speed = random.randint(4, 10)

    def fall(self):
        self.y += self.speed
        if self.y > HEIGHT:
            self.y = random.randint(-20, -5)
            self.x = random.randint(0, WIDTH)

    def draw(self, surface):
        pygame.draw.line(surface, RAIN_COLOR, (self.x, self.y), (self.x, self.y + self.length), 2)


class Star:
    def __init__(self):
        self.x = random.randint(0, WIDTH)
        self.y = random.randint(0, HEIGHT // 2)
        self.radius = random.randint(1, 3)
        self.brightness = random.randint(100, 255)
        self.change = random.choice([-1, 1])

    def twinkle(self):
        self.brightness += self.change * random.randint(1, 3)
        if self.brightness >= 255:
            self.brightness = 255
            self.change = -1
        elif self.brightness <= 100:
            self.brightness = 100
            self.change = 1

    def draw(self, surface):
        color = (self.brightness, self.brightness, self.brightness)
        pygame.draw.circle(surface, color, (self.x, self.y), self.radius)


rain = [Raindrop() for _ in range(300)]
stars = [Star() for _ in range(80)]
clock = pygame.time.Clock()

def lerp_color(c1, c2, t):
    return (
        int(c1[0] + (c2[0] - c1[0]) * t),
        int(c1[1] + (c2[1] - c1[1]) * t),
        int(c1[2] + (c2[2] - c1[2]) * t),
    )


while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

    screen.fill(BLACK)

    
    for star in stars:
        star.twinkle()
        star.draw(screen)

    
    for drop in rain:
        drop.fall()
        drop.draw(screen)

    now = pygame.time.get_ticks()

    
    if not finished_typing and now - last_word_time > typing_speed:
        if word_index < len(words):
            current_text += (" " if current_text else "") + words[word_index]
            word_index += 1
            last_word_time = now
        else:
            finished_typing = True
            last_word_time = now

    if finished_typing and now - last_word_time > delay_after_finish:
        index = (index + 1) % len(custom_texts)
        words = custom_texts[index][0].split()
        typing_speed = custom_texts[index][1]
        current_text = ""
        word_index = 0
        finished_typing = False
        last_word_time = now

    
    text_surface = font.render(current_text, True, WHITE)
    text_rect = text_surface.get_rect(center=(WIDTH // 2, HEIGHT // 2))
    screen.blit(text_surface, text_rect)

    
    transition_progress += transition_speed
    if transition_progress >= 1.0:
        transition_progress = 0.0
        color_index = next_color_index
        next_color_index = (next_color_index + 1) % len(RAINBOW_COLORS)

    current_color = lerp_color(RAINBOW_COLORS[color_index], RAINBOW_COLORS[next_color_index], transition_progress)

    name_surface = name_font.render(user_name, True, current_color)
    name_surface.set_alpha(120)
    name_rect = name_surface.get_rect(center=(WIDTH // 2, HEIGHT - 30))
    screen.blit(name_surface, name_rect)

    pygame.display.flip()
    clock.tick(60)
