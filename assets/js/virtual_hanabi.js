let canvas;
let bgm;
let fireworks = [];
let stars = [];

/*
 * 花火クラス
 */
class Firework {
  constructor(x, y, vx, vy, gv) {
    // 初期位置
    this.x = x;
    this.y = y;
    // 重力
    this.vx = vx;
    this.vy = vy;
    this.gv = gv;
    // 打ち上がる高さ
    this.maxHeight = random(height / 6, height / 2);
    this.fireHeight = height - this.maxHeight;
    // フレームカウンター
    this.frame = 0;
    // ステータスカウンター；0:初期, 1打ち上げ済み, 2:爆発済み
    this.type = 0;
    // 爆発まで遅延用変数
    this.next = 0;
    // 花火の色
    this.r = random(155) + 80;
    this.g = random(155) + 80;
    this.b = random(155) + 80;
    this.a = 255;
    // 玉の大きさ
    this.w = random(10, 5);
    // 残像表示用配列
    this.afterImages = [];
    // 爆発用配列
    this.explosions = [];
    // 消えてから爆発までの遅延時間
    this.exDelay = random(10, 40);
    // 爆発の大きさ
    this.large = random(5, 15);
    // 爆発の玉の数
    this.ball = random(20, 100);
    // 爆発から消えるまでの長さ
    this.exEnd = random(20, 40);
    // 爆発のブレーキ
    this.exStop = 0.96;
  }

  get getFrame() {
    return this.frame;
  }

  get getType() {
    return this.type;
  }

  /*
   * フレーム処理
   */
  fire() {
    switch (this.type) {
      case 0:
        this.rising();
        break;
      case 1:
        this.explosion();
        break;
    }
  }

  /*
   * 打ち上げアニメーション
   */
  rising() {
    // 頂点まで達したら消す
    if (this.y * 0.8 < this.maxHeight) {
      this.a = this.a - 6;
    }
    // 指定の高さまで上昇する
    this.x += this.vx;
    this.y -= this.vy * ((this.fireHeight - (height - this.y)) / this.fireHeight);

    // 残像を表示
    this.afterImages.push(new Afterimage(this.r, this.g, this.b, this.x, this.y, this.w, this.a));
    for (const ai of this.afterImages) {
      if (ai.getAlpha <= 0) {
        this.afterImages = this.afterImages.filter((n) => n !== ai);
        continue;
      }
      ai.rsImage();
    }

    // 打ち上げ表示
    this.update(this.x, this.y, this.w);

    // 全ての表示が消えたら処理の種類を変更する
    if (this.afterImages.length == 0) {
      if (this.next === 0) {
        // 消えてから爆発まで遅延させる
        this.next = this.frame + Math.round(this.exDelay);
      } else if (this.next === this.frame) {
        // 花火の大きさ
        for (let i = 0; i < this.ball; i++) {
          // 爆発の角度
          const r = random(0, 360);
          // 花火の内側を作る（バラバラ）
          const s = random(0.1, 0.9);
          const vx = Math.cos((r * Math.PI) / 180) * s * this.large;
          const vy = Math.sin((r * Math.PI) / 180) * s * this.large;
          this.explosions.push(new Firework(this.x, this.y, vx, vy, this.exStop));
          // 花火の輪郭を作る（丸くなるようにする）
          const cr = random(0, 360);
          const cs = random(0.9, 1);
          const cvx = Math.cos((cr * Math.PI) / 180) * cs * this.large;
          const cvy = Math.sin((cr * Math.PI) / 180) * cs * this.large;
          this.explosions.push(new Firework(this.x, this.y, cvx, cvy, this.exStop));
        }
        this.a = 255;
        this.type = 1;
      }
    }
  }

  // 爆発アニメーション
  explosion() {
    for (const ex of this.explosions) {
      ex.frame++;
      // 爆発し終わった花火を配列から除去する
      if (2 === ex.getType) {
        this.explosions = this.explosions.filter((n) => n !== ex);
        continue;
      }

      // 残像を描画
      if (0 === Math.round(random(0, 32))) {
        ex.afterImages.push(new Afterimage(this.r, this.g, this.b, ex.x, ex.y, ex.w, ex.a));
      }

      for (const ai of ex.afterImages) {
        if (ai.getAlpha < 0) {
          ex.afterImages = ex.afterImages.filter((n) => n !== ai);
          continue;
        }
        ai.exImage();
      }

      // 爆発を描画
      this.update(ex.x, ex.y, ex.w, ex.a);
      ex.x += ex.vx;
      ex.y += ex.vy;
      ex.vx = ex.vx * ex.gv;
      ex.vy = ex.vy * ex.gv;
      ex.vy = ex.vy + ex.gv / 30;
      if (this.exEnd < ex.frame) {
        ex.w -= 0.1;
        ex.a = ex.a - 4;
        if (ex.a < 0 && 0 === ex.afterImages.length) {
          ex.type = 2;
        }
      }
    }
  }

  /*
   * 花火を描画
   */
  update(x, y, w, a) {
    this.frame++;
    if (0 < this.a) {
      const c = color(this.r, this.g, this.b);
      c.setAlpha(a);
      fill(c);
      ellipse(x, y, w, w);
    }
  }
}

/*
 * 残像処理用クラス
 */
class Afterimage {
  constructor(r, g, b, x, y, w, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.x = x;
    this.y = y;
    this.w = w;
    this.a = a;
    this.vx = random(-0.24, 0.24);
    this.vy = random(0.2, 0.8);
    this.vw = random(0.05, 0.2);
    this.frame = 0;
  }

  get getAlpha() {
    return this.a;
  }

  /*
   * 打ち上げ用処理
   */
  rsImage() {
    if (0 < this.a) {
      this.update(this.r, this.g, this.b, this.x, this.y, this.w, this.a);
      this.r += 4;
      this.g += 4;
      this.b += 4;
      this.x = this.x + this.vx;
      this.y = this.y + this.vy;
      if (0 < this.w) {
        this.w = this.w - this.vw;
      }
      this.a = this.a - 4;
    }
  }

  /*
   * 爆発用処理
   */
  exImage() {
    if (0 < this.a) {
      this.update(this.r, this.g, this.b, this.x, this.y, this.w, this.a);
      this.r += 2.5;
      this.g += 2.5;
      this.b += 2.5;
      this.x = this.x + this.vx;
      this.y = this.y + this.vy;
      if (0 < this.w) {
        this.w = this.w - this.vw;
      }
      this.a = this.a - 1.5;
    }
  }

  /*
   * 残像を描画
   */
  update(r, g, b, x, y, w, a) {
    this.frame++;
    const c = color(r, g, b);
    c.setAlpha(a);
    fill(c);
    ellipse(x, y, w, w);
  }
}

/*
 * BGMのロード
 */
function preload() {
  bgm = loadSound('https://raw.githubusercontent.com/MxShun/virtual-hanabi/master/assets/bgm/fireworks1.mp3');
}

/*
 * 初期設定
 */
function setup() {
  createCanvas(document.documentElement.clientWidth, document.documentElement.clientHeight).position(0, 0);
  bgm.loop();
  preStars();
}

/*
 * フレーム毎処理
 */
function draw() {
  drawBackgroung();
  drawStars();

  // 1/3秒ごとに1/2の確立で花火を打ち上げる
  if (frameCount % 20 == 0 && random() * 2 > 1) {
    fireworks.push(new Firework(random(width), height, 0, random(10, 30), 0.98));
  }

  for (const fw of fireworks) {
    // 爆発した花火を処理対象から外す
    if (fw.getType === 2 || fw.getFrame > 30000) {
      fireworks = fireworks.filter((n) => n !== fw);
      continue;
    }
    // 打ち上げアニメーション
    fw.fire();
  }
}

/*
 * ウィンドウリサイズ時処理
 */
function windowResized() {
  resizeCanvas(document.documentElement.clientWidth, document.documentElement.clientHeight);
  this.preStars();
}

/*
 * 画面クリック時処理
 */
function mousePressed() {
  const speed = random(10, 30);
  fireworks.push(new Firework(random(width), height, 0, speed, 0.98));
}

/*
 * 星の設定
 */
function preStars() {
  for (let i = 0; i < 100; i++) {
    stars.push([random(width), random(height / 2), random(1, 4)]);
  }
}

/*
 * 星の描画
 */
function drawStars() {
  for (const s of stars) {
    const c = color(random(150, 255), random(150, 255), 255);
    c.setAlpha(random(150, 200));
    fill(c);
    ellipse(s[0], s[1], s[2], s[2]);
  }
}

/*
 * 背景の描画
 */
function drawBackgroung() {
  noFill();
  // グラデーション描画
  for (let i = 0; i <= 0 + height; i++) {
    const inter = map(i, 0, 0 + height, 0, 1);
    const c = lerpColor(color(0, 0, 0), color(0, 0, 48), inter);
    stroke(c);
    line(0, i, 0 + width, i);
  }
}
