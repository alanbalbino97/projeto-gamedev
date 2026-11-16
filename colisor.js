
function Colisor() {
   this.sprites = [];
   this.spritesExcluir = [];
   this.aoColidir = null;
}
Colisor.prototype = {
   novoSprite: function(sprite) {
      this.sprites.push(sprite);
      sprite.colisor = this;
   },
   excluirSprite: function(sprite) {
      if (this.spritesExcluir.indexOf(sprite) === -1) this.spritesExcluir.push(sprite);
   },
   podemColidir: function(a, b) {
      var t1 = a.tipo, t2 = b.tipo;
      return (t1 === 'nave' && (t2 === 'ovni' || t2 === 'poder')) ||
             (t2 === 'nave' && (t1 === 'ovni' || t1 === 'poder')) ||
             (t1 === 'tiro' && t2 === 'ovni') ||
             (t2 === 'tiro' && t1 === 'ovni');
   },
   retangulosColidem: function(a, b) {
      return a.x < b.x + b.largura && a.x + a.largura > b.x &&
             a.y < b.y + b.altura && a.y + a.altura > b.y;
   },
   testarColisao: function(a, b) {
      var rets1 = a.retangulosColisao();
      var rets2 = b.retangulosColisao();
      for (var i = 0; i < rets1.length; i++) {
         for (var j = 0; j < rets2.length; j++) {
            if (this.retangulosColidem(rets1[i], rets2[j])) {
               a.colidiuCom(b);
               b.colidiuCom(a);
               if (this.aoColidir) this.aoColidir(a, b);
               return;
            }
         }
      }
   },
   processar: function() {
      var sprites = this.sprites;
      for (var i = 0; i < sprites.length; i++) {
         if (sprites[i].excluido) continue;
         for (var j = i + 1; j < sprites.length; j++) {
            if (!sprites[i].excluido && !sprites[j].excluido &&
                this.podemColidir(sprites[i], sprites[j]))
               this.testarColisao(sprites[i], sprites[j]);
         }
      }
      if (this.spritesExcluir.length) {
         var descartados = this.spritesExcluir;
         this.sprites = this.sprites.filter(function(sprite) {
            return !sprite.excluido && descartados.indexOf(sprite) === -1;
         });
         this.spritesExcluir = [];
      }
   }
};
