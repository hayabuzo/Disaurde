const version   = "0.331";

// SETTINGS

let file_type = "jpg";

let image_url = "";
//let image_url = "https://miro.medium.com/max/746/1*5aL4dPHXvvaDnAQxmMRLug.png";
//let image_url = "https://sun9-75.userapi.com/impf/c841324/v841324325/2052e/9OXxiEwdOqY.jpg?size=1280x1104&quality=96&sign=4afb1878280e0a25b52ae95f4d6a6363&type=album";





































const debug       = false;
const music       = false;
const ios         = false;
p5.disableFriendlyErrors = true;

// ==================================================================================================== vert 

const shader_vert = ` attribute vec3 aPosition; attribute vec2 aTexCoord; varying vec2 vTexCoord;
void main() {
  vTexCoord = aTexCoord;                            
  vec4 positionVec4 = vec4(aPosition, 1.0);
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;  

  gl_Position = positionVec4;
}`;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// ==================================================================================================== shaderX

const shaderX = ` precision mediump float; varying vec2 vTexCoord;
#define TWO_PI 6.28318530718
uniform sampler2D img_input,imc_input,imf_input,imz_input, imt_input;
uniform float chan, mode, Ra, Rb, Rc, Rw;
uniform float time, width, height, quality, kFPS, slowdown, fade;

float EXR (float val, float pwr, float amp) {
  return fract ( val * pow( 10.0, pwr ) ) * amp;
}
float EXL (float val, float pwr, float amp) {
  float r = EXR ( val , pwr , amp+1.0 );
  return (floor(r));
}

float dither8x8(vec2 position, float brightness) {
// shader by  jfons_  https://www.shadertoy.com/view/4dVyRz
// https://github.com/hughsk/glsl-dither/blob/master/8x8.glsl
  int x = int(mod(position.x, 8.0));
  int y = int(mod(position.y, 8.0));
  int index = x + y * 8;
  float limit = 0.0;
  if (x < 8) {
    if (index == 0) limit = 0.015625;
    if (index == 1) limit = 0.515625;
    if (index == 2) limit = 0.140625;
    if (index == 3) limit = 0.640625;
    if (index == 4) limit = 0.046875;
    if (index == 5) limit = 0.546875;
    if (index == 6) limit = 0.171875;
    if (index == 7) limit = 0.671875;
    if (index == 8) limit = 0.765625;
    if (index == 9) limit = 0.265625;
    if (index == 10) limit = 0.890625;
    if (index == 11) limit = 0.390625;
    if (index == 12) limit = 0.796875;
    if (index == 13) limit = 0.296875;
    if (index == 14) limit = 0.921875;
    if (index == 15) limit = 0.421875;
    if (index == 16) limit = 0.203125;
    if (index == 17) limit = 0.703125;
    if (index == 18) limit = 0.078125;
    if (index == 19) limit = 0.578125;
    if (index == 20) limit = 0.234375;
    if (index == 21) limit = 0.734375;
    if (index == 22) limit = 0.109375;
    if (index == 23) limit = 0.609375;
    if (index == 24) limit = 0.953125;
    if (index == 25) limit = 0.453125;
    if (index == 26) limit = 0.828125;
    if (index == 27) limit = 0.328125;
    if (index == 28) limit = 0.984375;
    if (index == 29) limit = 0.484375;
    if (index == 30) limit = 0.859375;
    if (index == 31) limit = 0.359375;
    if (index == 32) limit = 0.0625;
    if (index == 33) limit = 0.5625;
    if (index == 34) limit = 0.1875;
    if (index == 35) limit = 0.6875;
    if (index == 36) limit = 0.03125;
    if (index == 37) limit = 0.53125;
    if (index == 38) limit = 0.15625;
    if (index == 39) limit = 0.65625;
    if (index == 40) limit = 0.8125;
    if (index == 41) limit = 0.3125;
    if (index == 42) limit = 0.9375;
    if (index == 43) limit = 0.4375;
    if (index == 44) limit = 0.78125;
    if (index == 45) limit = 0.28125;
    if (index == 46) limit = 0.90625;
    if (index == 47) limit = 0.40625;
    if (index == 48) limit = 0.25;
    if (index == 49) limit = 0.75;
    if (index == 50) limit = 0.125;
    if (index == 51) limit = 0.625;
    if (index == 52) limit = 0.21875;
    if (index == 53) limit = 0.71875;
    if (index == 54) limit = 0.09375;
    if (index == 55) limit = 0.59375;
    if (index == 56) limit = 1.0;
    if (index == 57) limit = 0.5;
    if (index == 58) limit = 0.875;
    if (index == 59) limit = 0.375;
    if (index == 60) limit = 0.96875;
    if (index == 61) limit = 0.46875;
    if (index == 62) limit = 0.84375;
    if (index == 63) limit = 0.34375;
  }
  return brightness < limit ? 0.0 : 1.0;
}
vec4  Blend(vec4 a, vec4 b, float mode, float mixval, float tune) {

  vec4 m;  

  // Normal
  if (mode == 0.0 ) {
    m = mix(a, b, mixval);
  }

  // Threshold Lighten
  if (mode == 1.0) { 
    float bvg = dot(b.rgb, vec3(0.33333));
    m = mix(a, step(0.5,bvg) > 0.5 ? b : a , mixval);
  } 

  // Zebra
  if (mode == 2.0) { 
    float cvg = dot(a.rgb+b.rgb, vec3(0.33333));
    m = mix(a, cvg < 1.0 ? 1.0-a-b : a+b-1.0, mixval);  
  }  
  
  // Screen  
  if (mode == 3.0) 
    m = mix(a, pow(1.0-(1.0-a)*(1.0-b),vec4(4.0)), mixval);    
  
  // Substract ???
  if (mode == 4.0)
    m = mix( mix(a, a+b-1.0, mixval),
             mix(a, abs(1.0-a+b), mixval),
             tune);
  
  // Difference ??
  if (mode == 5.0) 
    m = mix(a, abs(b-a), 50.0);
             
  // Divide ??
  if (mode == 6.0) 
    m = mix( mix(a, a/b, mixval),
             mix(a, a/(b/a), mixval),
             tune);
  
  return m;
  
}

vec3  rgb2hsb(vec3 c){
  // Color conversion function from Sam Hocevar: lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
  vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}
vec3  hsb2rgb(vec3 c){
  // Color conversion function from Sam Hocevar: lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
vec4  img2bw(vec4 img){
  img.rgb = vec3(dot(img.rgb, vec3(0.2126,0.7152,0.0722)));
  return img;
}
vec4  img2avg(vec4 img){
  img.rgb = vec3(dot(img.rgb, vec3(0.33333)));
  return img;
}

float c2m(vec2 c) {
  return sqrt(pow(c.x,2.0) + pow(c.y,2.0));
}
float c2d(vec2 c) {
  return atan( (c.y) , (c.x) );
}
float r2x(vec2 r) {
  return r.x * cos(r.y);
}
float r2y(vec2 r) {
  return r.x * sin(r.y);
}
float pst1(float u, float s) {
  return u = u - mod(u,s);
}
vec2  pst2(vec2 u, float s) {
  return u = u - mod(u,s);
}

vec2 dslow(float z) {
  if (slowdown == 0.0 )
    return vec2(z,z);
  if (slowdown == 1.0 )
    return vec2 (0.05,0.05*width/height);

}

vec2 rand(vec2  p) { 
  // from https://www.shadertoy.com/view/4dKBDR
  p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) ); 
  return fract(sin(p)*43758.5453); 
}
float nexto(float n) {
  //return fract(pow(n+abs(cos(pow(n,n))),abs(sin(n*1000.0))));
  //return fract(pow((n*1000.0),n));
  return abs(sin(n*10.0));
}

void chan00() { // SYSTEM

  vec2 uv = vec2(vTexCoord.x, 1.0-vTexCoord.y);
  vec4 img0, img1, img_out;
  
  if (mode==1.0)  { // FADING
    img0 = texture2D(imf_input,uv);
    img1 = texture2D(img_input,uv);
    img_out = mix(img1,img0,fade);
  }
  
  if (mode==2.0)  { // EMPTY
    img0 = texture2D(img_input,uv);
    img_out = img0;
  }
  
  if (mode==3.0)  { // REV
    uv.y = 1.0-uv.y;
    img0 = texture2D(img_input,uv);
    img_out = img0;
  }
  

  gl_FragColor = img_out;
  
}

void chan10() { // FRAMING
  
  vec2 uv = vec2(vTexCoord.x, 1.0-vTexCoord.y);
  vec4 img0, img1, img_out;
  
  // Mrrror input & output
  if (mode==0.0 || mode==1.0) {
    
    float post = EXR ( Ra , 0.0 , 00.23 ) + 0.1;
    float type = EXL ( Rc , 0.0 , 01.00 );
    //float rndX = EXR ( Rw , 0.0 , 01.00 );

    vec2 uvo, uvz, uvr;
    vec3 pim = texture2D(img_input,uv).rgb;
    
    pim = ( pim - mod(pim,post) ) * ( 1.0/(1.0-post) );
    
    //pim = mod(pim,0.1)*vec3(10.0);
    
    uvo = uv;
    uvo.y = uvo.y * (height/width);  
    
    float xshift = pim.r;
    float yshift = pim.g;
    float roto   = mod(pim.b,0.1)*(10.0) * 6.28 - 3.14;

    uvo.x -= xshift;
    uvo.y -= yshift;
    
    uvr.x = c2m(vec2(uvo)); 
    uvr.y = c2d(vec2(uvo)); 

    uvz.x = r2x(vec2( uvr.x, uvr.y + roto* dslow(1.0).x ) ) + xshift;
    uvz.y = r2y(vec2( uvr.x, uvr.y + roto* dslow(1.0).y ) ) + yshift;
    
    uvz.y = uvz.y * (width/height);  
    
    if (type==0.0) {
      uvz = abs(1.0-abs(1.0-uvz));
      uvz = abs(1.0-abs(1.0-uvz));
      uvz = abs(1.0-abs(1.0-uvz));
    }
    if (type==1.0) uvz = mod(uvz,1.0);
    
    if (mode == 0.0) img_out = texture2D( img_input , uvz );
    if (mode == 1.0) img_out = texture2D( imc_input , uvz );

  }

  // Edges
  if (mode==2.0) {
    
    float type =  EXL ( Rc , 0.0 , 01.00 );
    
    float weight = 
        abs(dot(texture2D(img_input, vec2 (uv.x-(1.0/width), uv.y      )).rgb,vec3(0.33333)) - 
            dot(texture2D(img_input, vec2 (uv.x+(1.0/width), uv.y      )).rgb,vec3(0.33333)))+
        abs(dot(texture2D(img_input, vec2 (uv.x     , uv.y-(1.0/height))).rgb,vec3(0.33333)) - 
            dot(texture2D(img_input, vec2 (uv.x     , uv.y+(1.0/height))).rgb,vec3(0.33333)));
    img0.rgb = vec3(weight);
    
    //type = 2.0;
    
    if (type==0.0)   img_out = img0;
    if (type==1.0)   img_out = mix(vec4(0.0),texture2D(img_input,uv),weight*2.0);
    //if (type==2.0)   img_out = img0.r>0.1?vec4(1.0):vec4(0.0);
    
    img_out.a = texture2D(img_input,uv).a;
    
  }
  
  // Threshold
  if (mode==3.0) {
    
    float level = EXR ( Rb , 0.0 , 00.70 ) + 0.20;
    
    img_out = texture2D(img_input, uv);
    img_out = dot(img_out.rgb,vec3(0.33333))> level ? vec4(1.0) : vec4(0.0);
    img_out.a = texture2D(img_input,uv).a;
    
  }
  
  // Dithering
  if (mode==4.0) {

    vec2 fragCoord = vTexCoord*vec2(width*quality,height*quality);
    img0 = texture2D(img_input,uv);
    
    float pixelSize = EXL ( Rb , 0.0 , 01.00 ) + 1.0; 
    
    vec4 color0 = img0*0.2;
    vec4 color1 = img0*0.5;
    vec4 color2 = img0*1.0;
    vec4 color3 = img0*1.5;
    
    fragCoord = floor(fragCoord/pixelSize) * pixelSize;
    fragCoord /= pixelSize;
      
    float ll = img2bw(img0).r * 4.0;
    float b;
    
    if (ll <= 1.5) b = ll/1.5;
    else if (ll <= 2.5) b = ll-1.5;
    else b = (ll-2.5)/1.5;
    
    float d = dither8x8(fragCoord, b);
    
    if      (ll <= 1.5)    img_out = d == 0.0 ? color0 : color1;
    else if (ll <= 2.5)    img_out = d == 0.0 ? color1 : color2;
    else if (ll <= 3.975)  img_out = d == 0.0 ? color2 : color3;
    else img_out = color3;
    
  }
   
  // Mosaic
  if (mode==5.0) {
    float size =  EXL ( Rb , 0.0 , 07.00 ) + 3.0; 
    float type =  EXL ( Rc , 0.0 , 01.00 );  
    vec2 uvx;
    
    size = 1.0/size;
    uvx.x = pst1(uv.x,size);
    uvx.y = pst1(uv.y,size*width/height);
    if (type == 0.0) img_out =  texture2D(img_input,uvx);
    if (type == 1.0) img_out =  mod(texture2D(imt_input,uvx),vec4(0.1))*10.0;
    img_out.a = texture2D(img_input,uvx).a;
  }
  
  // Blur
  if (mode==6.0) {
  
    img_out = texture2D( imt_input, uv);
    img_out.a = texture2D( img_input, uv).a;
    //img_out.a = img_out.r > 0.4 ? 1.0 : 0.0;
    
  }
    
  img_out = clamp(img_out, vec4(0.0), vec4(1.0));
  gl_FragColor = img_out;

}

void chan20() { // COLOR

  vec2 uv = vec2(vTexCoord.x, 1.0-vTexCoord.y);
  vec4 img0, img1, img_out;
  
  img0 = texture2D(img_input, uv);

  float Kin = EXR ( Rb , 0.0 , 0.5 );
  float Rin = EXR ( Rb , 1.0 , 0.5 ) + Kin;
  float Gin = EXR ( Rb , 2.0 , 0.5 ) + Kin;
  float Bin = EXR ( Rb , 3.0 , 0.5 ) + Kin;
  
  //vec3 pick = texture2D(img_input, vec2(Rin*2.0, Gin*2.0)).rgb;
  //Rin =  pick.r;
  //Gin =  pick.g;
  //Bin =  pick.b;
  
  float Kou = EXR ( Ra , 0.0 , 0.5 );
  float Rou = EXR ( Ra , 1.0 , 1.0 ) * Kou;
  float Gou = EXR ( Ra , 2.0 , 1.0 ) * Kou;
  float Bou = EXR ( Ra , 3.0 , 1.0 ) * Kou;
  
  vec3 Cin = vec3(Rin,Gin,Bin);
  vec3 Cou = vec3(Rou,Gou,Bou);
  
  float dist = 1.0-distance(img0.rgb,Cin);
  float bw = img2bw(img0).r; //dot(img0.rgb, vec3(0.2126,0.7152,0.0722));

  // Color Change
  if (mode==2.0) {
    img1.rgb = mix(img0.rgb,Cou,dist);
    dist = 1.0-distance(img0.rgb,Cou);
    img_out.rgb = mix(img1.rgb,Cin,dist);
  }

  // Tone
  if (mode==3.0) {
    img_out.rgb = mix(vec3(bw),Cou,dist);
  }

  // Hue Shift
  if (mode==4.0) {
    float type =  EXL ( Rc , 0.0 , 01.00 );
    float shift; 
    if (type==0.0) shift = sin(time);
    if (type==1.0) shift = Kou*2.0;
    img1.rgb = rgb2hsb(img0.rgb);
    img1.r = img1.r+shift;
    img1.rgb = hsb2rgb (img1.rgb);
    img_out.rgb = img1.rgb;
  }

  // Invert
  if (mode==5.0) {
    img_out.rgb = vec3(1.0)-img0.rgb;
  }

  // Posterize
  if (mode==6.0) {
    float colorQuality = EXL ( Ra , 0.0 , 6.00 )+4.0;
    img_out = floor(img0*vec4(colorQuality))/vec4(colorQuality)*vec4(1.0/(1.0-1.0/colorQuality));
  }
  
  img_out.a = img0.a;
  gl_FragColor = img_out;
  
}

void chan30() { // DISTORT

  vec2 uv = vec2(vTexCoord.x, 1.0-vTexCoord.y);
  vec2 uvx, uvd;
  vec4 img0, img1, img_out;
  img0 = texture2D(img_input, uv);

  // Output Displace
  // Input Displace
  if (mode==0.0 || mode==1.0) {
  
    float dir =   EXR ( Ra , 0.0 , 99.99 ); 
    float type =  EXL ( Rc , 0.0 , 01.00 );
    
    if (type==1.0) img0.rgb = rgb2hsb(img0.rgb);
    
    float xShift = (img0.r*2.0-1.0) * (floor(dir)      -50.0)*0.01; 
    float yShift = (img0.b*2.0-1.0) * (fract(dir)*100.0-50.0)*0.01; 
    
    uvx = abs(1.0-abs(1.0-uv+vec2(xShift,yShift)* dslow(1.0) ));
    
    if (mode==0.0) img_out = texture2D( img_input , uvx );
    if (mode==1.0) {
      img_out = texture2D( imc_input , uvx );
      img_out.a = texture2D( img_input , uvx ).a;
    }
    
  }

  // Symmetry
  if (mode==2.0) {
    
    float type =  EXL ( Rc , 0.0 , 03.00 );
    
    uvx = abs( 1.0 - abs( 1.0 - uv));
    
    //float level = EXR ( Rb , 1.0 , 00.50 ) + 0.25;
    float level = 0.5;
    
    if (type == 0.0) uvx.x = uv.x < level ? uv.x : level*2.0 - uv.x;
    if (type == 1.0) uvx.x = uv.x > level ? uv.x : level*2.0 - uv.x;
    if (type == 2.0) uvx.y = uv.y < level ? uv.y : level*2.0 - uv.y;
    if (type == 3.0) uvx.y = uv.y > level ? uv.y : level*2.0 - uv.y;
    
    uvx = abs( 1.0 - abs( 1.0 - uvx));
      
    img_out = texture2D(img_input, uvx);
    
  }

  // Wave
  if (mode==3.0) {
    
    vec2 wave1, wave2, wave3;
    
    float frqY0 =  EXR ( Ra , 0.0 , 10.00 ); 
    float ampY0 =  EXR ( Ra , 1.0 , 00.20 );  
    float spdY0 =  EXR ( Ra , 2.0 , 05.00 );
    
    
    float frqX1 = nexto(frqY0)*20.0-10.0;
    float frqY1 = nexto(frqX1)*20.0-10.0;
    float frqX2 = nexto(frqY1)*20.0-10.0;
    float frqY2 = nexto(frqX2)*20.0-10.0;
    float frqX3 = nexto(frqY2)*20.0-10.0;
    float frqY3 = nexto(frqX3)*20.0-10.0;
    
    float ampX1 = nexto(ampY0)*0.15;
    float ampY1 = nexto(ampX1)*0.15;
    float ampX2 = nexto(ampY1)*0.15;
    float ampY2 = nexto(ampX2)*0.15;
    float ampX3 = nexto(ampY2)*0.15;
    float ampY3 = nexto(ampX3)*0.15;
    
    float spdX1 = nexto(spdY0)*10.0-5.0;
    float spdY1 = nexto(spdX1)*10.0-5.0;
    float spdX2 = nexto(spdY1)*10.0-5.0;
    float spdY2 = nexto(spdX2)*10.0-5.0;
    float spdX3 = nexto(spdY2)*10.0-5.0;
    float spdY3 = nexto(spdX3)*10.0-5.0;
    
    wave1.y = cos( uv.x * frqX1 + time * spdX1  ) * ampX1;
    wave1.x = sin( uv.y * frqY1 + time * spdY1  ) * ampY1;
    
    wave2.y = cos( uv.x * frqX2 + time * spdX2  ) * ampX2;
    wave2.x = sin( uv.y * frqY2 + time * spdY2  ) * ampY2;
    
    wave3.y = cos( uv.x * frqX3 + time * spdX3  ) * ampX3;
    wave3.x = sin( uv.y * frqY3 + time * spdY3  ) * ampY3;

    img_out = texture2D(img_input, abs( 1.0 - abs( 1.0 - uv + (wave1 + wave2 + wave3) * dslow(1.0) ) ));
    
  }
  
  // Watercolor 
  if (mode==4.0) {

    // code by Victor Li http://viclw17.github.io/2018/06/12/GLSL-Practice-With-Shadertoy/
    
    float ampX =  EXR ( Ra , 0.0 , 01.00 );     
    float ampY =  EXR ( Ra , 1.0 , 01.00 ); 
    
    float spd  =  EXR ( Rb , 0.0 , 02.00 ) + 0.01;   
    float pwr  =  EXR ( Rb , 1.0 , 01.00 );   
    
    uvx = uv;
    
    for(int i=1; i<10; i++) {
      uvx.x+=0.3/float(i)*sin(float(i)*3.0*uvx.y+time*spd)+ampX;
      uvx.y+=0.3/float(i)*cos(float(i)*3.0*uvx.x+time*spd)+ampY;
    }
    float r=cos (uvx.x+uvx.y+1.0)*0.5+0.5;
    float g=sin (uvx.x+uvx.y+1.0)*0.5+0.5;
    float b=(sin(uvx.x+uvx.y)+cos(uvx.x+uvx.y))*0.5+0.5;
    img0.rgb = vec3(r,g,b);
    img_out = texture2D(img_input, abs( 1.0 - abs( 1.0 - uv +(img0.rb*vec2(2.0)-vec2(1.0))*pwr* pow(dslow(1.0),vec2(1.5,1.5)) ) )  );
    
  }
   
  if (mode==99.0) {
    float px = 1.0/width;
    float py = 1.0/height;
    vec2 pc = vec2(px,py)*10.0;
    
    img0 = texture2D( img_input, uv );
    img1 = texture2D( imf_input, uv );
    
    img_out = mix(img0,img1,0.95);
    
  }
  
  gl_FragColor = img_out;

}

void chan40() { // FEEDBACK

  vec2 uv = vec2(vTexCoord.x, 1.0-vTexCoord.y);
  vec4 img0, img1, img_out, imf;  
  img0 = texture2D(img_input,uv);
  
  // Output feedback
  // Input feedback
  if (mode == 0.0 || mode == 1.0) {
    
    float angleX, angleY, feedback, aimX, aimY; 
  
    float ang =       EXR ( Ra , 1.0 , 99.99 );  
    float base =      EXL ( Rb , 0.0 , 04.00 ) * 0.05;
    
    feedback = 0.79+base; 
    
    aimX = (floor(ang)      -50.0);
    aimY = (fract(ang)*100.0-50.0);
    
    angleX = (sin(img0.r * aimX * 0.1 * TWO_PI)) * 0.015 * 0.2 * sqrt(kFPS);
    angleY = (cos(img0.g * aimY * 0.1 * TWO_PI)) * 0.015 * 0.2 * sqrt(kFPS);
    
    imf = texture2D(imf_input,uv + vec2(angleX,-angleY) * feedback);

    if (mode == 0.0) img_out = mix(texture2D(img_input,uv),imf,feedback);
    if (mode == 1.0) img_out = mix(texture2D(imc_input,uv),imf,feedback);
    
    img_out.a = img0.a;

  }

  // Zoom Feedback
  if (mode == 2.0) {
    
    float type =  EXL ( Rc , 0.0 , 01.00 );
    float k    =  EXL ( Ra , 0.0 , 02.00 )+1.00;
    
    if (type==1.0) k = -k;
    k = k * 0.005 * kFPS;
    
    img1 = texture2D(imf_input,uv*vec2(1.0-k)+vec2(k*0.5));
    float avg = img2avg(img1).r;
    
    img_out = mix(img0,img1,1.0-avg*0.1);
    img_out.a = img0.a;
  
  }
  
  // Expanding
  if (mode == 3.0) {
    
    float size  =  EXR ( Ra , 0.0 , 00.20 )+0.20;
    float speed =  EXR ( Rb , 0.0 , 00.80 )+0.20;
    //float type =  EXL ( Rc , 0.0 , 01.00 );
    
    float k = 0.02*speed;
    k *= kFPS;

    vec2 rsz = vec2(  (uv-vec2(size,size)) /(1.0-size*2.0));

      img_out = mix(
        texture2D(imf_input, uv*vec2(1.0-k)+vec2(k*0.5)),
        texture2D(img_input, rsz),
        (uv.x>size && uv.x<(1.0-size) && uv.y>size && uv.y<(1.0-size))?texture2D(img_input, rsz).a:0.0
      );

  }
  
  // Channel Delay
  if (mode==4.0) {
    img1 = texture2D(imf_input, uv);

    float speed = EXL ( Rb , 0.0 , 04.00 ) + 1.0;

    img_out.r = mix( img0.r , img1.r , clamp(1.0+sin(time*speed          )*0.1,0.5,1.0));
    img_out.g = mix( img0.g , img1.g , clamp(1.0+sin(time*speed+6.28*0.33)*0.1,0.5,1.0));
    img_out.b = mix( img0.b , img1.b , clamp(1.0+sin(time*speed+6.28*0.66)*0.1,0.5,1.0));
    
    img_out.a = img0.a;
  }  
  

  // Zebra
  if (mode == 99.0) {
    
    img_out = mix(img0,texture2D(imf_input,uv),1.02);//+0.2*abs(sin(time)));
    img_out.rgb = mod(img_out.rgb,1.0);
    
    //if (img2avg(img_out).r>=1.0) img_out.rgb = img_out.gbr*0.8;
    
    //if (img_out.r>=1.0) img_out.r*=0.5;
    //if (img_out.g>=1.0) img_out.g*=0.5;
    //if (img_out.b>=1.0) img_out.b*=0.5;
    //
    //if (img_out.r<=0.0) img_out.r+=0.5;
    //if (img_out.g<=0.0) img_out.g+=0.5;
    //if (img_out.b<=0.0) img_out.b+=0.5;
    
    //if (dot(img_out.rgb, vec3(0.33333)) > 1.0) img_out.rgb = img_out.rgb-img0.rgb;
    //if (dot(img_out.rgb, vec3(0.33333)) < 0.0) img_out.rgb = img_out.rgb+img0.rgb;
  
  }

  // Alpha blur
  if (mode == 99.0) {
    
    float feed = EXR ( Ra , 0.0 , 00.20 );
    img_out = img0;
    img_out.a = 0.01+feed;
  
  }

  // Test Feedback
  if (mode == 99.0) {
    
    img_out = mix(texture2D(img_input, uv),texture2D(imf_input, uv),sin(time*5.0)*0.05+0.96);
    //img_out.rgb = mod(img_out.rgb,1.0);
    
  }
  
  gl_FragColor = img_out;

}

void chan50() { // SHUTTER

  vec2 uv = vec2(vTexCoord.x, 1.0-vTexCoord.y);
  vec4 img0, img1, img_out;

  img0 = texture2D(img_input,uv);

  // Input Threshold
  // Output Threshold
  if (mode==0.0 || mode==1.0) {
    
    float len =   EXR ( Ra , 0.0 , 00.20 );
    float type =  EXL ( Rc , 0.0 , 01.00 );
    
    float avg = dot(img0.rgb, vec3(0.33333));
    float pos;

    if (type==0.0) pos = 0.2+0.8*abs(1.0-mod(time,2.0));
    if (type==1.0) pos = 0.2+mod(time,0.8);
    
    if (step(pos+len,avg)<0.5 && step(pos-len,avg)>0.5) {
      img_out = mode == 1.0 ? texture2D(imc_input,uv) : img0;
      img_out.a = smoothstep(pos-len,pos,avg) - smoothstep(pos,pos+len,avg);
    }
    
  }

  // Alpha White
  if (mode == 2.0) {
    
    float avg = dot(img0.rgb, vec3(0.33333));
    img_out = img0;
    img_out.a = clamp(avg-(1.0-img_out.a),0.0,1.0);//*9.0;
  
  }
  
  // Alpha Feedback
  if (mode == 3.0) {
  
    img0 = texture2D( imf_input , uv );
    img1 = texture2D( img_input , uv );
    img_out = mix(img0,img1,img1.a);
    
  }

  // Alpha Posterize
  if (mode == 4.0) {
    
    float t =   EXR ( Rb , 0.0 , 01.00 );
    float l =   EXR ( Rb , 1.0 , 01.00 );
    
    img_out = img0;
    //t = 0.02;
    img_out.a = mod(img_out.g,t)>t*l?1.0:0.0;
    
  }

  gl_FragColor = img_out;
  
}

void chan60() { // BLEND

  vec2 uv = vec2(vTexCoord.x, 1.0-vTexCoord.y);
  //uv = vec2(vTexCoord.x, 1.0-vTexCoord.y);
  vec4 img0, img1, img_out;
  
  // Bo: Blend Output
  // Bi: Blend Input
  if (mode==0.0 || mode==1.0) { 
  
    float level = EXR ( Rb , 1.0 , 00.50 ) + 0.25;
  
    img0 = texture2D(imc_input, uv);
    img1 = texture2D(img_input, uv);
    
    float avg0 = dot(img0.rgb, vec3(0.33333));
    float avg1 = dot(img1.rgb, vec3(0.33333));
    
    float smooth = 0.1;

    float mixv;
    
    if (mode == 0.0) {
      mixv = smoothstep(level-smooth,level+smooth,avg1);
      img_out = mix( img0, img1, mixv );
    }
    
    if (mode == 1.0) {
      mixv = smoothstep(level-smooth,level+smooth,avg0);
      img_out = mix( img1, img0, mixv );
    }
    

    img_out.a = img1.a;

  }
  
  // Li: Blend Lighten
  if (mode==2.0) { 
    img0 = texture2D(imc_input, uv);
    img1 = texture2D(img_input, uv);
    img_out = max(img0,img1);
    img_out.a = img1.a;
  }

  // Qu: Quarter Mix
  if (mode==3.0) {
    vec4 q1, q2, q3, q4;
    vec4 t1, t2, t3, t4;

    float mixmode =  EXL ( Rc , 0.0 , 01.00 );
    
    q1 = texture2D(img_input, vec2(   uv.x*0.50,          uv.y*0.50));    
    q2 = texture2D(img_input, vec2(   uv.x*0.50+0.50,     uv.y*0.50));
    q3 = texture2D(img_input, vec2(   uv.x*0.50,          uv.y*0.50+0.50));    
    q4 = texture2D(img_input, vec2(   uv.x*0.50+0.50,     uv.y*0.50+0.50));
    
    // Lighten
    if (mixmode==0.0) {                  
      img_out = max(max(q1,q3),max(q2,q4)); 
    }
    
    // Threshold Light  
    if (mixmode==1.0) {
      
      float type   = EXL ( Rb , 1.0 , 03.00 );
      float level  = EXR ( Rb , 0.0 , 00.50 ) + 0.25;
      float smooth = 0.1;
      
      if (type==0.0) { t1 = q1; t2 = q2; t3 = q3; t4 = q4; }
      if (type==1.0) { t1 = q4; t2 = q3; t3 = q2; t4 = q1; }
      if (type==2.0) { t1 = q2; t2 = q4; t3 = q1; t4 = q3; }
      if (type==3.0) { t1 = q3; t2 = q1; t3 = q4; t4 = q2; }
      
      img_out = mix (t1,      t2, smoothstep(level-smooth,level+smooth, dot(t2.rgb,vec3(0.33333)) ));
      img_out = mix (img_out, t3, smoothstep(level-smooth,level+smooth, dot(t3.rgb,vec3(0.33333)) ));
      img_out = mix (img_out, t4, smoothstep(level-smooth,level+smooth, dot(t4.rgb,vec3(0.33333)) ));

    }

    img_out.a = q1.a+q2.a+q3.a+q4.a;
    //img_out.a = texture2D(img_input, uv).a;
    
  }  

  // Du: Double Mix
  if (mode==4.0) {
    vec4 q1, q2, q3, q4;
    vec4 r1, r2, r3, r4;
    
    q1 = texture2D(img_input, vec2(   uv.x*0.50,          uv.y*0.50));    
    q2 = texture2D(img_input, vec2(   uv.x*0.50+0.50,     uv.y*0.50));
    q3 = texture2D(img_input, vec2(   uv.x*0.50,          uv.y*0.50+0.50));    
    q4 = texture2D(img_input, vec2(   uv.x*0.50+0.50,     uv.y*0.50+0.50));
    
    float type   = EXL ( Rb , 1.0 , 03.00 );
    
    vec4 qr = vec4(1.0);
    
    if (type==0.0) { r1=q1;    r2=q2;    r3=q3;    r4=q4; }
    if (type==1.0) { r1=q1;    r2=q4;    r3=q3;    r4=q2; }
    if (type==2.0) { r1=q1;    r2=q4;    r3=q2;    r4=qr; }
    if (type==3.0) { r1=q2;    r2=q3;    r3=q4;    r4=qr; }

    //img_out = mix(r1,r2,r3.g>0.5?1.0:0.0);
    img_out = mix(r1,r2, smoothstep(0.45,0.55,r3.g));

    img_out.a = r4.r>0.5?1.0:0.0;

  }


  gl_FragColor = img_out;
  
}

void chan70() { // STAMP

  vec2 uv = vec2(vTexCoord.x, 1.0-vTexCoord.y);
  vec4 img0, img1, img_out;
  
  // Stamp
  if (mode==2.0) {
    
    float type =  EXL ( Rc , 0.0 , 01.00 );
    float gear =  EXL ( Rb , 0.0 , 01.00 );
    
    //type = 0.0;
    
    if (type==0.0) {
    
      float aimX =  EXR ( Ra , 0.0 , 02.00 ) - 01.00 ;
      float aimY =  EXR ( Ra , 1.0 , 02.00 ) - 01.00 ;
      
      float time5 = EXR ( Rw , 0.0 , 01.00 ) * 100.0 ;
      float rndX =  EXR ( Rw , 1.0 , 01.00 ) ;
      float rndY =  EXR ( Rw , 2.0 , 01.00 ) ;
      
      vec2 uv0 = 1.0 - uv;
      vec2 uv2 = vec2(cos(time5),sin(time5)) + ( uv0-vec2(cos(time5),sin(time5)) ) / sin(time5);
      img0 = texture2D(img_input, uv2);
      vec4 img1 = texture2D(img_input, vec2( rndX, rndY ));
      float xShift = (img0.r*2.0-1.0) * aimX * cos(time5);
      float yShift = (img0.g*2.0-1.0) * aimY * sin(time5); 
      if (Rw<(0.25+gear)*kFPS) img_out = texture2D(img_input, abs(1.0-abs(uv0*sin(time5) +vec2(xShift,yShift))));
      float avg = dot(img_out.rgb, vec3(0.33333));
      float isin = (sin(time5))*0.5+0.5;
      float thr = smoothstep(isin,isin+0.05,avg)-smoothstep(isin+0.25,isin+0.30,avg);
      //if (Rw<(0.25+gear)*kFPS) img_out = vec4 (img1.r,img1.g,img1.b,img0.a > 0.0 ? thr*0.65 : 0.0);
      if (Rw<(0.25+gear)*kFPS) {
        img_out = img1;
        img_out.a = img0.a > 0.0 ? thr*0.65 : 0.0;
      }
      
    }
    
    if (type==1.0) {
    
      float time5 = time*100.0;
      float aimX =  EXR ( Ra , 0.0 , 02.00 ) - 01.00 ;
      float aimY =  EXR ( Ra , 1.0 , 02.00 ) - 01.00 ; 
      float rndX =  EXR ( Rw , 0.0 , 01.00 );
      float rndY =  EXR ( Rw , 2.0 , 01.00 );
      vec2 rsz = vec2( uv - (vec2(rndX, rndY)-0.5)*2.0);
      img0 = texture2D(img_input, rsz);  
      float xShift = (img0.r*2.0-1.0) * aimX * cos(time5);
      float yShift = (img0.g*2.0-1.0) * aimY * sin(time5); 
      rsz += vec2(xShift,yShift)*0.5;
      img0 = texture2D(img_input, rsz);   
      float avg = dot(img0.rgb, vec3(0.33333));
      float isin = (sin(time5))*0.5+0.5;
      float thr = smoothstep(isin,isin+0.05,avg)-smoothstep(isin+0.25,isin+0.30,avg);
      vec3 img_color = texture2D(img_input, vec2(rndX,rndY)).rgb;
      img_out.a = rsz.x > 0.01 && rsz.y > 0.01 && rsz.x < 0.99 && rsz.y < 0.99 ? thr : 0.0;
      img_out.rgb = sin(time5) > 0.0 ?  (img_out.a > 0.0 ? img_color.rgb : img0.rgb) : img0.rgb;
      
    }
    
  if (img_out.a == 0.0) img_out.rgb = vec3(0.0);
    
  }
 
  // Dots
  if (mode==3.0) {
    float wink = height/width;
    float range = 0.1;
    float k1   =  EXR ( Ra , 1.0 , 01.00 );
    float type  = EXL ( Rc , 0.0 , 01.00 );
    float rndX =  EXR ( Rw , 0.0 , 01.00 );
    float rndY =  EXR ( Rw , 2.0 , 01.00 );
    img0 = texture2D(img_input, vec2(rndX,rndY));
    float avg = dot(texture2D(img_input, uv).rgb, vec3(0.33333));
    float pavg = dot(texture2D(img_input, vec2(rndX,rndY)).rgb, vec3(0.33333));
    img_out = (pow((uv.x-rndX),2.0)+pow((uv.y-rndY)*wink,2.0) < pow(avg*0.1+avg*k1*0.2,2.0)) 
      && avg<(pavg+range) && avg>(pavg-range) ? (type == 0.0 ? img0 : texture2D(img_input, uv)) : vec4(0.0);
  }
 
  // Characters
  if (mode==4.0) {
    //img0 = texture2D( imf_input , uv );
    //img1 = texture2D( imz_input , uv );
    //img_out = mix(img0,img1,img1.a);
    img_out = texture2D( imz_input , uv );
  }
  
  // Thumbnails
  if (mode==5.0) { 
  
    float delay =    EXR ( Rb , 0.0 , 00.90 );
  
    float rndX =     EXR ( Rw , 0.0 , 01.00 );
    float rndY =     EXR ( Rw , 2.0 , 01.00 );
    float rndZ =     EXR ( Rw , 1.5 , 01.00 );
  
    //                (move to center)       (move to rnds scaled from -1 to +1)    (set image scale)
    vec2 rsz = vec2(  (uv-vec2(0.5,0.5)  -  vec2((sin(rndX*100.0))*0.6, (cos(rndY*100.0))*0.6)) *  (rndZ*15.0+2.0));
    img_out = texture2D(img_input, rsz);
    
    if (Rw<delay*kFPS) {
      img_out.a = img_out.a > 0.0 ? ( ((rsz.x > 0.01 && rsz.x < 0.99) && (rsz.y > 0.01 && rsz.y < 0.99)) ? 1.0 : 0.0) : 0.0;
    }
    else img_out.a = 0.0;
    img_out.rgb = img_out.a == 0.0 ? vec3(0.0) : img_out.rgb;
  }
  
  gl_FragColor = img_out;
  
}

void chan80() { // 

  vec2 uv = vec2(vTexCoord.x, 1.0-vTexCoord.y);
  vec4 img0, img1, img_out;

  img_out = texture2D( img_input , uv );

  gl_FragColor = img_out;
  
}


void main() {
  
  if (chan == 0.0) chan00();
  if (chan == 1.0) chan10();
  if (chan == 2.0) chan20();
  if (chan == 3.0) chan30();
  if (chan == 4.0) chan40();
  if (chan == 5.0) chan50();
  if (chan == 6.0) chan60();
  if (chan == 7.0) chan70();
  if (chan == 8.0) chan80();
  
}`;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function dline(x0,y0,x1,y1,a=255,col=255,weight=1) {
  strokeWeight(weight);
  stroke(255-col,a);      line(x0+1, y0+1, x1+1, y1+1);
  stroke(col,a);          line(x0, y0, x1, y1);
}

function drect(x0,y0,w,h,a=255,col=255,weight=1) {
  noFill();               strokeWeight(weight);
  stroke(255-col,a);      rect(x0+1, y0+1, w, h);
  stroke(col,a);          rect(x0, y0, w, h);
}

function dcircle(x0,y0,r,a=255,col=255,weight=1) {
  noFill();               strokeWeight(weight);
  stroke(255-col,a);      circle(x0+1, y0+1, r);
  stroke(col,a);          circle(x0, y0, r);
}

function dtext(x0,y0,size,txt,a=255,col=255) {
  textSize(size);         noStroke();  
  fill(255-col,a);        text(txt,x0+2, y0+2);
  fill(col,a);            text(txt,x0, y0);
}

function btext(x0,y0,size,txt,a=128) {

  stroke(255,a);      noFill();          textSize(size);  
  textStyle(BOLD);    text(txt,x0,y0);   textStyle(NORMAL);  
  
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

let input; 

function preset_encrypt() {
  
  let pres = [];
  
  pres[0] = m2n(m)     ;
  pres[1] = Ra[0]      ;
  pres[2] = Rb[0]      ;
  pres[3] = Rc[0]      ;
  pres[4] = holdup[0]  ;
  pres[5] = holdup[1]  ;
  pres[6] = holdup[2]  ;
  pres[7] = playing[0] ;
  pres[8] = beat[0]    ;
  
  pres = join(pres,';');
  
  return(pres);
  
}

function preset_decrypt(pres) {
  
  pres = split(pres,';');
  let loaded = pres.length>1 ? true : false;

  //                          default values
  
  m          = loaded ? pres[0]  :  1263   ;  m = n2m(m);
  Ra[0]      = loaded ? pres[1]  :  0.5    ;  r5(Ra);
  Rb[0]      = loaded ? pres[2]  :  0.5    ;  r5(Rb);
  Rc[0]      = loaded ? pres[3]  :  0.5    ;  r5(Rc);
  holdup[0]  = loaded ? pres[4]  :  false  ;  holdup[0]  = boolean(holdup[0]);
  holdup[1]  = loaded ? pres[5]  :  false  ;  holdup[1]  = boolean(holdup[1]);
  holdup[2]  = loaded ? pres[6]  :  false  ;  holdup[2]  = boolean(holdup[2]);
  playing[0] = loaded ? pres[7]  :  true   ;
  beat[0]    = loaded ? pres[8]  :  1      ;

}

function preset_save(slot) {
  storeItem('slot#'+slot, str( preset_encrypt() ));
}

function preset_load(slot) {
  if (getItem('slot#'+slot) != getItem('empty_item')) 
    preset_decrypt(getItem('slot#'+slot));
  else if (slot==0) 
    preset_decrypt('');
}

function preset_del(slot) {
  removeItem('slot#'+slot);
}

function preset_export() {
  save(
    [preset_encrypt()], 
    "dsf-" + 
    get_name().toLowerCase() + "-" +
    version + "-" +
    year() + nf(month(),2) + nf(day(),2) + "-" +
    nf(hour(),2) + nf(minute(),2) + nf(second(),2) +
    ".txt"
  );
}

function preset_import(file) {
  if (file.type === 'text') {
    preset_decrypt(file.data);
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function settings_save() {
  
  let set = [];
  
  set[0] = quality     ;
  set[1] = burst[0]    ;
  set[2] = cam_type    ;
  set[3] = file_type   ;
  set[4] = frame[1]    ;
  set[5] = density     ;
  
  set = join(set,';');
  
  storeItem('settings', str( set ));
  
}

function settings_load(q) {
  
  let set = split( (getItem('settings') != getItem('empty_item') ? getItem('settings') : '') , ';');
  let loaded = set.length > 1 ? true : false;
  if(q=="r") loaded = false;
  
    //                                        default values
    cam_type     = loaded & set[2]>=0  ? set[2]  :  2     ; 
    density      = loaded & set[5]>=0  ? set[5]  :  1.0   ;
    quality      = loaded & set[0]>0   ? set[0]  :  1.0   ;      if(q=="q") return;
    burst[0]     = loaded & set[1]>0   ? set[1]  :  2     ; 
    file_type    = loaded & set[3]     ? set[3]  :  'jpg' ; 
    frame[1]     = loaded              ? set[4]  :  1     ;      // might be error with '0' frame transformed into '' after loading
  
}

function img_save() {
  save(stackImg, "ds-"+year()+nf(month(),2)+nf(day(),2)+"-"+nf(hour(),2)+nf(minute(),2)+nf(second(),2)+"#"+burst[1]+"-"+get_name().toLowerCase()+'.'+file_type);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function r5(val) {
  for (let i = 1; i <= elmax; i++) {  // ABC values for each layer
    val[i] = fract(sqrt(val[i-1]*10)).toFixed(8); 
                                       
                           
  }
}

function m2n(m) {
	let n = "";
	for (let i=0; i<m.length; i++) { 
    if (m[i]>0) n = n+""+m[i];	
  }
	return(n);
}

function n2m(n) {
	let mt = [];
	let nl = (str(n)).length;
	for (let i=0; i<nl/2; i++) {	
    mt[i+1] = floor(fract(n/pow(10,nl-i*2))*100);	
  }
	return(mt);
}

function n2w(n) {
  let w = "";
  if (n) {
    n = str(n).match(/(.{1,2})/g);
    if (n.length == 1) w = e[n];
    else {
      for (let i=0; i<n.length; i++) {
        w = w + e[n[i]];
      }
      if (w) w = w.substr(0,01).toUpperCase()+w.substr(1,99).toLowerCase();
    }
  }
	return(w);
}

function get_name() {
  
  e = [];  for (let i=0; i<100; i++) { e[i] = ''; }

  e[10] = 'Ro'; // Mrrror Output
  e[11] = 'Ri'; // Mrrror Input

  e[12] = 'Ed'; // Edges
  e[13] = 'Ol'; // Threshold
  e[14] = 'It'; // Dithering
  e[15] = 'Mo'; // Mosaic
  e[16] = 'Lu'; // Blur

  e[22] = 'Co'; // Color Change
  e[23] = 'To'; // Duotone
  e[24] = 'Hu'; // Hue Shift
  e[25] = 'Ne'; // Negative
  e[26] = 'Os'; // Posterize
  
  e[30] = 'Do'; // Displace Output 
  e[31] = 'Di'; // Displace Input  
  
  e[32] = 'Sy'; // Symmetry
  e[33] = 'Wa'; // Wave
  e[34] = 'Wo'; // Watercolor
  
  e[40] = 'Fo'; // Feedback Output
  e[41] = 'Fi'; // Feedback Input 
  
  e[42] = 'Zo'; // Zoom Feedback
  e[43] = 'Ex'; // Expanding  Feedback
  e[44] = 'De'; // Channels Delay
  
  e[50] = 'So'; // Threshold Shutter Output
  e[51] = 'Si'; // Threshold Shutter Input
  
  e[52] = 'Al'; // Alpha White
  e[53] = 'Af'; // Alpha Feedback
  e[54] = 'Ap'; // Alpha Posterize
  
  e[60] = 'Bo'; // Blend Output 
  e[61] = 'Bi'; // Blend Input  
  
  e[62] = 'Li'; // Lighten
  e[63] = 'Qu'; // Quarter Mix
  e[64] = 'Du'; // Double Mix
  
  e[72] = 'St'; // Stamp
  e[73] = 'Oo'; // Spots
  e[74] = 'Aa'; // Character
  e[75] = 'Um'; // Thumbnails
  
  allow_element = [];
  for (let i=0; i<e.length; i++) {
    if (e[i]) allow_element.push(i);
  }

  allow_feedback = [40,41,42,43,44,47,53];
  allow_blur     = [15,16];  
  allow_fx       = [73,74];

  return(n2w(m2n(m)));
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function keyCheck() {
  for (let k = 0; k < 110; k++) {
    keydown[k] = keyIsDown(k) ? true : false;
  }
}

function keyPressed() {
  keyCheck();
  return false; // prevent any default behaviour of browser
}

function keyReleased() {
  keyCheck();
  return false; // prevent any default behaviour of browser
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function peak() {
  
  if (music) {
  
    let len = 20;
    let lowpass = 0.0;
  
    volhis.push(mic.getLevel());
    
    if(volhis.length > len) {
      volhis.splice(0,1);
      avghis.splice(0,1);
    }
    
    let avg = 0;
    for (let i = 0; i < len; i++) { avg += volhis[i]; }
    avghis.push(avg/=len);
    
    let out = volhis[len-1]-avghis[len-1]-lowpass;
    out = out>0?out:0;
    
    return(out);
  
  }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class jb {

  constructor(x, y, width, height) {
    
		this.x = x;                   this.y = y;                       
    this.width = width;           this.height = height; 
    
    this.tLU = "";                this.tLD = "";                    
    this.tRU = "";                this.tRD = "";   
    this.tCN = "";                this.tSizeSet = floor(yblock/4);
      
    this.alpha = 255;
    
    this.light = 0;               this.lightmax = 255;
    this.border = 10;             this.lightmin = this.lightmax/2;
    
    this.pushlight = false;       this.holdup   = false;
    mouseIsPressed = false;       this.bigstyle = false;
    
    /*
    this.mpr = false;
    this.pressed = false;
    this.clicked = false;
    this.over = false;
    */
    
  }
  
  create() {
    
    if (this.clicked) { 
      this.light = this.lightmax;
      this.fClick = frameCount;
      this.mClick = millis();
      this.clicked = false;
      this.holdup = false;
    }
    
    if (mouseX>this.x && mouseX<this.x+this.width && mouseY>this.y && mouseY<this.y+this.height) this.over = true;
    else this.over = false;

    if (mouseIsPressed) {
      if (!this.mpr) { 
        this.mpX = mouseX;     this.mpY = mouseY; 
        if (this.mpX>this.x && this.mpX<this.x+this.width && this.mpY>this.y && this.mpY<this.y+this.height) this.clicked = true;
      }
      this.mpr = true;
      if (this.mpX>this.x && this.mpX<this.x+this.width && this.mpY>this.y && this.mpY<this.y+this.height) {
        this.pressed = true;
        if (this.pushlight) this.light = this.lightmax;
      }
      if (!this.over) this.pressed = false;

    } else {
      this.mpr = false;      this.pressed = false;
      this.mpX = "";         this.mpY = "";
      this.mClick = "x";
    }
    
    
    
    if (!this.bigstyle) {
      
      this.tSize = this.holdup ? this.tSizeSet*2 : this.tSizeSet;
      
      textAlign(LEFT, TOP);       dtext(this.x+10, this.y+10, this.tSize, this.tLU, 255);
      textAlign(RIGHT, TOP);      dtext(this.x+this.width-10, this.y+10, this.tSize, this.tRU, 255);
      textAlign(LEFT, BOTTOM);    dtext(this.x+10, this.y+this.height-10+3, this.tSize, this.tLD, 255);
      textAlign(RIGHT, BOTTOM);   dtext(this.x+this.width-10, this.y+this.height-10+3, this.tSize, this.tRD, 255);
      textAlign(CENTER, CENTER);  dtext(this.x+this.width/2, this.y+this.height/2, this.tSize, this.tCN, 255);
      
    } else {
      
      if (this.holdup) {
        noStroke();      
        fill  (255,255); 
      } else {
        stroke(255,255);      
        noFill(); 
      }
      
      textStyle(BOLD); 
      textSize(this.holdup ? this.tSizeSet*3 : this.tSizeSet*2); 
      
      textAlign(LEFT, TOP);       text(this.tLU,this.x+10,            this.y+10               );
      textAlign(RIGHT, TOP);      text(this.tRU,this.x+this.width-10, this.y+10               );
      textAlign(LEFT, BOTTOM);    text(this.tLD,this.x+10,            this.y+this.height-10+3 );
      textAlign(RIGHT, BOTTOM);   text(this.tRD,this.x+this.width-10, this.y+this.height-10+3 );
      textAlign(CENTER, CENTER);  text(this.tCN,this.x+this.width/2,  this.y+this.height/2    );
      
      textStyle(NORMAL); 
      
    }
    
    drect(this.x, this.y, this.width, this.height, this.alpha);
    
    if (this.light > this.lightmin) {
      if(frameCount-this.fClick>3) this.light -= 15*(kFPS); 
      stroke((frameCount-this.fClick)%4==0?0:255,this.light); noFill();
      strokeCap(SQUARE);
      strokeWeight(6.0);
      rect(this.x+3, this.y+3, this.width-6, this.height-6); 
      strokeWeight(1.0);
    }

  }

}

function holder(btn) {
  if(btn.pressed && millis()-btn.mClick > 200) {
    btn.holdup = true;
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function preload() {
  
  if (image_url!="") {
    cam_input = loadImage(image_url, callback);
    //quality   = 1;    
  }
  
  //if (music) song = loadSound("music.mp3");
  
}

function callback() {
  CW = cam_input.width ;
  CH = cam_input.height;
}

function setup() {
    
  WW = window.innerWidth  -4;   // Window size - html fix
  WH = window.innerHeight -4;   // Window size - html fix
  createCanvas(WW, WH);
  
  settings_load('q');  // Loading quality
  //if (mouseIsPressed) settings_load('r');
  if (getURLParams().q>0) quality = getURLParams().q/100;

  
  pixelDensity(Number(density));
  //print(pixelDensity());
  
  background(255)  ;  textAlign(CENTER,CENTER);   fill(0);  noStroke;
  textSize(WW*0.1) ;  text('Disaurde',   WW*0.5,  WH*0.5);
  textSize(WW*0.05);  text('v.'+version, WW*0.6,  WH*0.5+WW*0.07);
  textStyle(ITALIC);                              
  textSize(20)     ;  text('LOADING',    WW-65 ,  WH-20);
  textStyle(NORMAL);
  
  
  
  load_step = 0;
  
}

function setup_values() {
  
  //frameRate(10);
  
  UIH = WH;          // Interface Height
  UIW = min(WW,WH);  // Interface Width
  
  UIL = WW <= WH ? 0  : WW/2-UIW/2;  // Left  (Xmin) coordinate of interface
  UIR = WW <= WH ? WW : WW/2+UIW/2;  // Right (Xmax) coordinate of interface

  yblock = UIH*0.1;  // Main block size
  xblock = UIW*0.1;  // Main block size

  mls   = [0,0,0];   // Millis for beat counter
  beat  = [0,0];     // Beats per second, beat click

  frame = ['x',0,0];   // Delay between frames, current frame, next frame
  burst = [1,1];    // Burst speed, burst counter

  keydown = [];      // Keyboard array
  elmax = 5;         // Maximum number of elements

  m  = [];  Ra = [];  Rb = [];  Rc = [];  holdup = [];
  
  playing = [true,true,true];  // Time mode (=/~), playing mode (play/stop), last state of playing mode for burst
  fade = 0;
  
  rev  = false;
  pmd  = 0;

  preset_load(0);   // Loading last or default
  settings_load();  // Loading last or default

  if (getURLParams().f) preset_decrypt(getURLParams().f);  // Looking for preset data in URL

  CTR = (WH/WW >= CH/CW) ? WW/CW : WH/CH;   // Transformation coefficient to fit camera window into workspace
  width  = CW*quality*(1/pixelDensity()); 
  height = CH*quality*(1/pixelDensity());                  // Linking main sizes to camera size

  imgX = createGraphics(width, height, WEBGL);	         // Main processing image
  shdX = imgX.createShader(shader_vert, shaderX);        // Main processing shader

  imgZ     = createGraphics(width, height);              // Image for non-shader processing effects
  stackImg = createGraphics(width, height);              // Flattered processed image
  tinyImg  = createGraphics(width*0.025, height*0.025);  // Small image for blur-like effect

  stackImg.image(cam_input,0,0,stackImg.width,stackImg.height); // Preload cam image for feedback effects

  if (music) {
    mic = new p5.AudioIn();
    mic.start();
    volhis = [];    
    avghis = [];
    peakreset = true;
    pnum = 0;
  }
  
}

function draw() {

  if (load_step==0) { // Create Camera
    if (image_url=="") {
      if (cam_type==0) fMode = "user";
      else fMode = "environment";
      let camera_width  = cam_type==2 ? {ideal: 640} : {ideal: 10000};
      let camera_height = cam_type==2 ? {ideal: 480} : {ideal: 10000};
      let camera_settings = {
        audio: false,
        video: { 
          width:  camera_width,
          height: camera_height,
          facingMode: fMode 
        }
      };	
      cam_input = createCapture(camera_settings, callback);  
      cam_input.hide();
    }
    load_step = 1; 
  }

  if (load_step==1 && ((image_url == "" && cam_input.loadedmetadata) || image_url != "")) { 
    setup_values(); 
    load_frame();
    load_step = 2; 
  }

  if (load_step==2) { 
    draw_frame();
  }

}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function load_frame() {

  if (frame[1] == 1 || frame[1] == 0) { // MAIN
  
    preset_save(0); // saving current preset on entering frame

    btn_PR  =  new jb(UIL+yblock,0,UIW-yblock*2,yblock);                  btn_PR.tCN = get_name(); 
    btn_R   =  new jb(UIR-yblock,0,yblock,yblock);                        btn_R.tCN = "↺";                    btn_R.tSizeSet = floor(yblock/3);
    btn_Q   =  new jb(UIL,0,yblock,yblock);                               btn_Q.tCN = "⇆";                    btn_Q.tSizeSet = floor(yblock/3);


    btn_SAVE = new jb(UIL+yblock,UIH/2,UIW-yblock*2,UIH/2-yblock);
    btn_PLAY = new jb(UIL+yblock,yblock,UIW-yblock*2,UIH/2-yblock);
    btn_HIDE = new jb(UIL+yblock,UIH-yblock,UIW-yblock*2,yblock);                         btn_HIDE.tCN = "HIDE" ; 
    
    if (frame[1]==0) {
      btn_SAVE = new jb(UIL,UIH/2,UIW,UIH/2-yblock);         btn_SAVE.alpha = 0;
      btn_PLAY = new jb(UIL,0    ,UIW,UIH/2       );         btn_PLAY.alpha = 0;
      btn_HIDE = new jb(UIL,UIH-yblock,UIW ,yblock);         btn_HIDE.alpha = 0;       btn_HIDE.tCN = "SHOW" ; 
      btn_MIN0 = new jb(-WW*2.0+UIL,0,UIW,UIH);
    }
    
    btn_A = new jb( UIL+UIW-yblock, yblock*1, yblock, yblock*2 );  btn_A.tRD = "A";  btn_A.holdup = holdup[0];              //btn_A.bigstyle = true;
    btn_B = new jb( UIL+UIW-yblock, yblock*3, yblock, yblock*2 );  btn_B.tRD = "B";  btn_B.holdup = holdup[1];              //btn_B.bigstyle = true;
    btn_C = new jb( UIL+UIW-yblock, yblock*5, yblock, yblock*2 );  btn_C.tRD = "C";  btn_C.holdup = holdup[2];              //btn_C.bigstyle = true;
    btn_T = new jb( UIL+UIW-yblock, yblock*7, yblock, yblock*2 );                    btn_T.tSizeSet = floor(yblock/3);      //btn_T.bigstyle = true;
    btn_V = new jb( UIL+UIW-yblock, yblock*9, yblock, yblock*1 );  btn_V.tRD = "v";  btn_V.tSizeSet = floor(yblock/3);
   
    //btn_TEST1 = new jb( UIL, yblock*2, yblock, yblock );                 btn_TEST1.tLD = "T1";
    //btn_TEST2 = new jb( UIL, yblock*3, yblock, yblock );                 btn_TEST2.tLD = "T2";
 
    btn_SET   = new jb( UIL, yblock*1, yblock, yblock*2 );                 btn_SET.tLU = "SET";
    btn_PMD   = new jb( UIL, yblock*3, yblock, yblock*2 );                 btn_PMD.tLU = "play\nmode";
    
    btn_BURST = new jb( UIL, yblock*5, yblock, yblock*2 );   
    btn_BPS   = new jb( UIL, yblock*7, yblock, yblock*2 );    
    
  }
  
  if (frame[1] == 2) { // ELEMENTS
  
    imgX.resetShader(shdX);
    
    btn_E = [];
    oldpr = m2n(m);
    newpr = "";

    bsize = UIH/13 < UIW/9 ? UIH/13 : UIW/9 ;
    lsh = (UIW - bsize*8)/2;

    //btn_E = new jb(0,0,bsize,bsize);
    //btn_E.alpha = 0;

  
    for (let i = 1; i<9; i++) {
      for (let j = 0; j<10; j++) {
        if(allow_element.includes(i*10+j) || debug) {
          btn_E[i*10+j] = new jb(
            UIL+lsh+bsize*(i-1)    +(j>1?0.0:bsize*0.1),
            bsize/2+bsize*j         ,
            bsize                   *(j>1?1.0:0.8),
            bsize                   *(j>1?1.0:0.8)
          );
          btn_E[i*10+j].tCN = (n2w(i*10+j));//.toLocaleLowerCase();
          //text(n2w(i*10+j).toLocaleLowerCase(),100+50*i,100+50*j);
        }
      }
    }
  
    btn_HELP = new jb( UIL+lsh+bsize*6,  bsize/2+bsize*9,  bsize*2,   bsize );       btn_HELP.tCN = "HELP"; 
    btn_DATA = new jb( UIL+lsh+bsize*4,  bsize/2+bsize*9,  bsize*2,   bsize );       btn_DATA.tCN = "DATA"; 

    btn_NAME = new jb( UIL+lsh+bsize*2,  bsize/2+bsize*11, bsize*4,   bsize );                          
    btn_DEL  = new jb( UIL+lsh,          bsize/2+bsize*11, bsize*1.5, bsize );       btn_DEL.tCN = "DEL"; 
    btn_OK   = new jb( UIL+lsh+bsize*6.5,bsize/2+bsize*11, bsize*1.5, bsize );       btn_OK.tCN = "OK"; 

  }
  
  if (frame[1] == 3) { // DATA

    btn_SLOT = [];

    for (let i = 1; i<=18; i++) {
      btn_SLOT[i]     = new jb( UIL+lsh + (i<10 ? 0 : bsize*4),bsize/2+bsize+bsize* (i<10 ? i-1 : i-10),bsize*4,bsize ); 
    }

    btn_DEL  = new jb( UIL+lsh +bsize*0  ,bsize/2+bsize*11,bsize*1.0,bsize );       btn_DEL.tCN = "DEL"; 
    btn_SAVE = new jb( UIL+lsh +bsize*1.5,bsize/2+bsize*11,bsize*2.0,bsize );       btn_SAVE.tCN = "SAVE"; 
    btn_LOAD = new jb( UIL+lsh +bsize*4.0,bsize/2+bsize*11,bsize*2.0,bsize );       btn_LOAD.tCN = "LOAD"; 
    btn_OK   = new jb( UIL+lsh +bsize*6.5,bsize/2+bsize*11,bsize*1.5,bsize );       btn_OK.tCN = "OK"; 

    btn_SLOT.sel = "";

    btn_IMPORT = new jb( UIL+lsh +bsize*0.25,bsize/2,bsize*3.5,bsize*0.6 );        btn_IMPORT.tCN = "IMPORT"; 
    btn_EXPORT = new jb( UIL+lsh +bsize*4.25,bsize/2,bsize*3.5,bsize*0.6 );        btn_EXPORT.tCN = "EXPORT"; 
    
  }
  
  if (frame[1] == 4) { // IMPORT
    
    let hsize = UIH/10;
    let wsize = UIW/10;

    input = createFileInput(preset_import);
    
    input.position(UIL+wsize*4,        0.5*hsize+hsize*3*1.2,wsize*2,hsize*0.8);

    btn_OK =    new jb(UIL+wsize*4,        0.5*hsize+hsize*5*1.5,wsize*2,hsize*1);      btn_OK.tCN = "OK"; 
    
  }
  
  if (frame[1] == 5) { // SETTINGS
  
    btn_CAM = [];   
    btn_CAM.sel = "x";
    btn_CAM[0] = new jb( UIL+xblock*2+xblock*(0*2), yblock*1, xblock*2, yblock );      btn_CAM[0].tLD = "FRONT"; 
    btn_CAM[1] = new jb( UIL+xblock*2+xblock*(1*2), yblock*1, xblock*2, yblock );      btn_CAM[1].tLD = "MAIN"; 
    btn_CAM[2] = new jb( UIL+xblock*2+xblock*(2*2), yblock*1, xblock*2, yblock );      btn_CAM[2].tLD = "WEB"; 

    QN = [0.2,0.5,0.7,1.0,2.0,3.0];
    
    btn_QLT = [];
    btn_QLT.sel = "x";
    for (let i = 0; i<=5; i++) {
      if (i<3) btn_QLT[i] = new jb( UIL+xblock*2+xblock*(i    *2), yblock*3, xblock*2, yblock );
      else     btn_QLT[i] = new jb( UIL+xblock*2+xblock*((i-3)*2), yblock*4, xblock*2, yblock ); 
      btn_QLT[i].tLD = nfs(QN[i],1,1);
    }
    
    DN = [0.5,1.0,2.0];
    
    btn_DNS = [];
    btn_DNS.sel = "x";
    for (let i = 0; i<=2; i++) {
      btn_DNS[i] = new jb( UIL+xblock*2+xblock*(i    *2), yblock*6, xblock*2, yblock );
      btn_DNS[i].tLD = nfs(DN[i],1,1);
    }

    btn_CLOSE   = new jb( UIL+xblock*2, yblock*8, xblock*3,yblock );      btn_CLOSE.tCN = "CANCEL";  
    btn_APPLY   = new jb( UIL+xblock*5, yblock*8, xblock*3,yblock );      btn_APPLY.tCN = "APPLY"; 
  
  }
  
}

function draw_frame() {

  kFPS = 60/frameRate();
  time = playing[0] ? (millis()/3000) : Math.random()*100;
  beat[1] = false;
  if (fade>0) fade-=0.005*kFPS;
  else fade = 0;
  
  
  if (music) {
    if (peak()>0 && peakreset) {
      beat[1] = true;
      //randomSeed(peak());
      //randomSeed(frameCount);
      //print(frameCount+": "+peak());
      //randomSeed(frameCount);
      //pnum++;
      //print(floor(millis()/1000));
      //randomSeed(floor(millis()/1000));
    }
  if (peak()>0) peakreset = false;
  else peakreset = true;
  } else {
    mls[0] = millis()*0.1;
    if (mls[0]>(mls[1]+100/beat[0])) {
      beat[1] = true;
      mls[1] = mls[0];
    }
  }

  if (frame[1] == 1 || frame[1] == 0) {  // MAIN, HIDE
  
    multishader();
    
    let play_hold;
    let allow_processing;
    
    btn_PLAY.create();
      if (pmd == 0) {
        if (btn_PLAY.clicked) playing[1] = !playing[1];
        if (frame[1]!=0) {
          if (playing[1]) btn_PLAY.tRD = "PAUSE"; 
          else            btn_PLAY.tRD = "PLAY";  
          if (frameCount%10==0 || btn_PLAY.pressed) btn_PLAY.tLU = floor(frameRate());
        }
        if( btn_PLAY.pressed && (millis()-btn_PLAY.mClick>200) ) {
          play_hold = true;
          playing[1] = false;
          if (frame[1]!=0) btn_PLAY.tRD = ">>"; 
        } else
          play_hold = false;
      }
      if (pmd == 1) {
        playing[1] = false;
        btn_PLAY.tRD = ">"; 
        if (btn_PLAY.clicked) processing();
      }
      if (pmd == 2) {
        playing[1] = false;
        btn_PLAY.tRD = "> SAVE"; 
        if (btn_PLAY.clicked) {
          processing();
          img_save();
        }
      }
    
    if( play_hold || playing[1] || keydown[32] || keydown[18] ) { // keys SPACE and ALT
      allow_processing = true;
      keydown[18] = false;
    } else
      allow_processing = false;
  
    if (allow_processing) {
      processing();
    }

    if (frameCount%ceil(100/kFPS)==0) { // periodical saving of preset and settings
      preset_save(0);
      settings_save();
    }
      
    btn_HIDE.create();
      if (btn_HIDE.clicked || keydown[72] ) {    // H key
        frame[2] = (frame[1]==0) ? 1 : 0;  
        frame[0] = 100; 
        keydown[72] = false;
      }

    if (frame[1]!=0) 
    btn_PR.create();
      if (btn_PR.clicked) {
        frame[2] = 2;
        frame[0] = 100;
      }

    if (frame[1]!=0) 
    btn_R.create();  
      if (btn_R.clicked || keydown[82] ) {   // R key
        for (let i = 1; i <= elmax; i++) {  
          m[i] = random(allow_element) * (i == 1 ? 1 : ( Math.random() < 0.5 ? 0 : 1 )) ; 
        }
        btn_PR.tCN = get_name(); 
        fade = 1.0;
        keydown[82] = false;
      }
      if (keydown[69]) {  // E key
        for (let i = 2; i <= elmax; i++) {  
          m[i] = random(allow_element) * (i == 1 ? 1 : ( Math.random() < 0.5 ? 0 : 1 )) ; 
        }
        btn_PR.tCN = get_name(); 
        keydown[69] = false;
      }
    //print(fade);

    if (frame[1]!=0)
    btn_Q.create();  
    //image(gui_shft,btn_Q.x,btn_Q.y,btn_Q.width,btn_Q.height);
      if (btn_Q.clicked || keydown[81] ) { // Q key
        let m0 = m2n(m);
        for (let i = 1; i<10; i++) {
          if (m0 == m2n(m)) 
            m = n2m(m2n(shuffle(m, true)));
        }
        btn_PR.tCN = get_name(); 
        keydown[81] = false;
      }
    if (frame[1]!=0) 
    btn_A.create();
      holder(btn_A);
      if (btn_A.clicked || keydown[90] ||  (btn_A.holdup && beat[1]) ) {  // Z key
        //print("Ra:");
        Ra[0] = random();
        r5(Ra);
        //fade = 1.0;
        keydown[90] = false;
      }
 
    if (frame[1]!=0) 
    btn_B.create();
      holder(btn_B);
      if (btn_B.clicked ||  keydown[88] ||  (btn_B.holdup && beat[1]) ) {  // X key
        //print("Rb:");
        Rb[0] = random();
        r5(Rb);
        //fade = 1.0;
        keydown[88] = false;
      }
      
    if (frame[1]!=0) 
    btn_C.create();
      holder(btn_C);
      if (btn_C.clicked || keydown[67] ||  (btn_C.holdup && beat[1]) ) {  // C key
        //print("Rc:");
        Rc[0] = random();
        r5(Rc);
        //fade = 1.0;
        keydown[67] = false;
      }
      
    if (frame[1]!=0) 
    btn_T.create();
      if (btn_T.clicked) playing[0] = !playing[0];
      if (playing[0]) btn_T.tRD = "="; 
      else           btn_T.tRD = "~"; 
    
    btn_SAVE.create();
      //holder(btn_SAVE);
      let burst_beat = false;
      if( btn_SAVE.pressed && (millis()-btn_SAVE.mClick>200) ) {
        if (burst[1]==1) playing[2] = playing[1];
        if (frame[1]!=0) btn_SAVE.tLU = ">> BURST #"+burst[1]; 
        if (millis()>(mls[2]+1000/burst[0])) {
          processing();
          burst_beat = true;
          burst[1]++;
          playing[1] = false;
          mls[2] = millis();
        }
        //btn_SAVE.tCN=(burst_beat);
      } else {
        if (frame[1]!=0) btn_SAVE.tLU = "SAVE"; 
        if (burst[1]>1) {
          burst[1] = 1;
          playing[1] = playing[2];
        }
      }
      if (frame[1]!=0) btn_SAVE.tRD = floor(pixelDensity()*imgX.width) +'x' +floor(pixelDensity()*imgX.height);
      if ( btn_SAVE.clicked  || keydown[83] || (burst_beat && burst[1]>1) ) {  // S key
        img_save();
        keydown[83] = false;
      }
          
    if (frame[1]!=0) 
    btn_BURST.create();
    btn_BURST.tLU = 'burst\n' + "1/"+burst[0];
      if (btn_BURST.clicked) { 
        burst[0]++;
        if (burst[0]>5) burst[0]=1;
      }
      
    if (frame[1]!=0) 
    btn_BPS.create();
    btn_BPS.tLU = "bpm\n"+beat[0]*60;
      if (btn_BPS.clicked) { 
        beat[0]=Number(beat[0])+0.5;
        if (beat[0]==4) beat[0] = 10;
        if (beat[0]>10 || beat[0]<0.5) beat[0] = 0.5;
      }
     
    //if (frame[1]!=0) 
    //btn_TEST1.create();
    //  if (btn_TEST1.clicked) { 
    //  }
      
    if (frame[1]!=0) 
    btn_SET.create();
      if (btn_SET.clicked) { 
        frame[2] = 5;
        frame[0] = 100;
      }
      
    if (frame[1]!=0) 
    btn_PMD.create();
    //btn_PMD.tRD = pmd; 
      if (btn_PMD.clicked) { 
        pmd ++;
        if (pmd>2) pmd = 0;
      }
      
    if (frame[1]!=0) 
    btn_V.create();
      if (btn_V.clicked) { 
        rev = !rev;
      }

    holdup = [btn_A.holdup, btn_B.holdup, btn_C.holdup];
	  
  }
  
  if (frame[1] == 2) {  // ELEMENTS
    
    background(100);

    for (let i = 1; i<9; i++) {
      for (let j = 0; j<10; j++) {
        drect(UIL+lsh+bsize*(i-1)+(j>1?0.0:bsize*0.1),bsize/2+bsize*j,bsize*(j>1?1.0:0.8),bsize*(j>1?1.0:0.8),20); // Stroke for all
        if(allow_element.includes(i*10+j) || debug) {
          
          /*
          btn_E.create();
          let XS = UIL-lsh;
          let MX = mouseX-XS;
          let MY = mouseY+bsize/2;
          let NX = floor(MX/bsize)-2;
          let NY = floor(MY/bsize)-1;
          btn_E.tLU = NX;
          btn_E.tRD = NY;       
          
          if(NX<=9 && NY<=9 && allow_element.includes(NX*10+NY)) {
            btn_E.x = (MX-MX%bsize)+(NY>1?0.0:bsize*0.1)+XS;
            btn_E.y = -bsize/2+(MY-MY%bsize);
            btn_E.width = btn_E.height = bsize*(NY>1?1.0:0.8);
            if(btn_E.clicked && str(newpr).length < 10) newpr = str(newpr)+str(NX*10+NY);
          } else {
            btn_E.x = -100;
            btn_E.y = -100;
          }
          */
          
          let H = 255;
          let L = 128;
          let M = 255*0.66;
          let D = 255*0.33;
          let P = 12*j;
          let Q = 8 *j;
          let S = 4 *j;
          
               if (i==1) fill( H -P, L   , L +P, 100);
          else if (i==2) fill( L   , L +P, H -P, 100);
          else if (i==3) fill( L +P, H   , L   , 100);
          else if (i==4) fill( H   , H -P, L +P, 100);
          else if (i==5) fill( H -P, L +P, H   , 100);
          else if (i==6) fill( L +P, H -S, H -P, 100);
          else if (i==7) fill( M -Q, D +Q, D +P, 100);
          else if (i==8) fill( L -P, L   , M   , 100);
          else fill(100);
          noStroke();
          rect(UIL+lsh+bsize*(i-1)+(j>1?0.0:bsize*0.1),bsize/2+bsize*j,bsize*(j>1?1.0:0.8),bsize*(j>1?1.0:0.8));    // Fill for allowed
          //drect(UIL+lsh+bsize*(i-1)+(j>1?0.0:bsize*0.1),bsize/2+bsize*j,bsize*(j>1?1.0:0.8),bsize*(j>1?1.0:0.8),255); // Stroke for allowed
          //dtext(UIL+lsh+bsize*(i-1)+bsize/2, bsize/2+bsize*j+bsize/2-(j>1?0.0:bsize*0.05), bsize/2.5,n2w(i*10+j));
  
          btn_E[i*10+j].create();
          if(btn_E[i*10+j].clicked && str(newpr).length < 10) newpr = str(newpr)+str(i*10+j);
          
          if (bsize>50 && debug) {
            textSize(bsize/6); 
            fill(255,80); noStroke();
            text((i*10+j),UIL+lsh+bsize*(i-1)+bsize*0.85,bsize/2+bsize*j+bsize*0.15);
          }
        }
      }
    }
  
    dtext(UIL+UIW/2,bsize*11-bsize/16,bsize/2.5,n2w(oldpr)+ (debug ? " ("+oldpr+")" : ""));


    fill(100); noStroke();
    rect(UIL+lsh+bsize*4,  bsize/2+bsize*9,  bsize*4,   bsize*1);
   

    btn_DATA.create();
      if (btn_DATA.clicked) {
        frame[2] = 3;
        frame[0] = 100;
      }
      
    btn_HELP.create();
      if (btn_HELP.clicked) {
        window.open("https://disaurde.ru/readme.html");
      }

    btn_DEL.create();
      if (btn_DEL.clicked) newpr = newpr > 999 ? floor(newpr/100) : "";
    
    btn_OK.create();
      if (btn_OK.clicked) {
        if (n2w(newpr)!='') m = n2m(newpr);
        frame[2] = 1;
        frame[0] = 100;
      }
    
    blinker = str(newpr).length >= 10 ? "" : (millis()%1000 < 500 ? "_" : " ");
    
    btn_NAME.create();
      if (btn_NAME.clicked) newpr = oldpr;
    
    btn_NAME.tCN = n2w(newpr) + blinker;
    
  }

  if (frame[1] == 3) {  // DATA

    background(100);

    for (let i = 1; i<=18; i++) {
      btn_SLOT[i].create(); 
      if (btn_SLOT[i].clicked) {
        btn_SLOT.sel = i;
      }
      if (getItem('slot#'+i) != getItem('empty_item')) {
        let eln = str(getItem('slot#'+i)+"").split(';');
        btn_SLOT[i].tCN = i+": "+ n2w(eln[0]); 
      }
      else 
        btn_SLOT[i].tCN = '-';
    }
    
    btn_DEL.create();
      if (btn_DEL.clicked) {
        preset_del(btn_SLOT.sel);
        btn_SLOT.sel = "";
      }

    btn_SAVE.create();
      if (btn_SAVE.clicked) {
        preset_save(btn_SLOT.sel);
        btn_SLOT.sel = "";
        //frame[2] = 1;
        //frame[0] = 100;
      }      

    btn_LOAD.create();
      if (btn_LOAD.clicked) {
        preset_load(btn_SLOT.sel);
        btn_SLOT.sel = "";
        //frame[2] = 1;
        //frame[0] = 100;
      } 

    btn_OK.create();
      if (btn_OK.clicked) {
        frame[2] = 1;
        frame[0] = 100;
      }

    if (btn_SLOT.sel!="") btn_SLOT[btn_SLOT.sel].light = btn_SLOT[btn_SLOT.sel].lightmax;
    dtext(UIL+UIW/2,bsize*11,bsize/2.5,n2w(m2n(m)));

    btn_IMPORT.create();
      if (btn_IMPORT.clicked) {
        frame[2] = 4;
        frame[0] = 100;
      }
    
    btn_EXPORT.create();
      if (btn_EXPORT.clicked) {
        preset_export();
      }

  }

  if (frame[1] == 4) {  // IMPORT
        
    background(100);

    btn_OK.create();
      if (btn_OK.clicked) {
        frame[2] = 3;
        frame[0] = 100;
        input.remove();
      }

  }
  
  if (frame[1] == 5) {  // SETTINGS
  
    background(100);
    let ts = min(yblock,xblock);

    textAlign(LEFT, BOTTOM);
    btext(UIL +xblock*2  , yblock*1+ts*0.1,ts,"CAMERA:");
    
    if (btn_CAM.sel!="x") btn_CAM[btn_CAM.sel].light = btn_CAM[btn_CAM.sel].lightmax;
    for (let i = 0; i<=2; i++) {
      btn_CAM[i].create();
      if (btn_CAM[i].clicked) {
        btn_CAM.sel = i;
      }
    }

    textAlign(LEFT, BOTTOM);
    btext(UIL +xblock*2  , yblock*3+ts*0.1,ts,"QUALITY:");
    
    if (btn_QLT.sel!="x") btn_QLT[btn_QLT.sel].light = btn_QLT[btn_QLT.sel].lightmax;
    for (let i = 0; i<=5; i++) {
      btn_QLT[i].create();
      if (btn_QLT[i].clicked) {
        btn_QLT.sel = i;
      }
    }
    
    textAlign(LEFT, BOTTOM);
    btext(UIL +xblock*2  , yblock*6+ts*0.1,ts,"SCREEN:");
    
    if (btn_DNS.sel!="x") btn_DNS[btn_DNS.sel].light = btn_DNS[btn_DNS.sel].lightmax;
    for (let i = 0; i<=2; i++) {
      btn_DNS[i].create();
      if (btn_DNS[i].clicked) {
        btn_DNS.sel = i;
      }
    }
    
    
    btn_CLOSE.create();
      if (btn_CLOSE.clicked) {
        frame[2] = 1;
        frame[0] = 100;
      }
      
    btn_APPLY.create();
      if (btn_APPLY.clicked) {
        cam_type =      btn_CAM.sel!="x" ?      btn_CAM.sel     : cam_type;
        quality  =      btn_QLT.sel!="x" ?      QN[btn_QLT.sel] : quality;
        density  =      btn_DNS.sel!="x" ?      DN[btn_DNS.sel] : density;
        frame[1] = 1;
        settings_save();
        if(image_url=="") cam_input.remove();
        setup();
      }

    //textAlign(LEFT, TOP);
    //btext(UIL,0,ts,"SETTINGS");

    
      
  }

  reframe();
  
}

function reframe() {
  if (frame[0] > 0) frame[0] -= 20*kFPS;
  else if (frame[0] <= 0) {
    frame[1] = frame[2];
    load_frame();
    frame[0] = 'x';
  } 
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function multishader() {

  background(0);
  image(
    stackImg, 
    (WW-CW*CTR)*0.5,
    (WH-CH*CTR)*0.5,
    CW*CTR,
    CH*CTR
  );

}

function processing() {
    flayer = 100;
    //run_shader(cam_type,00);
    let layers = 0;
    for ( let i = 1; i <= elmax; i++ ) {
      if (ios) run_shader(02,elmax+2);
      if (m[i]>0) {
        run_shader(m[i],i);  
        layers++;
      }
    } 
    if (fade>0) run_shader(01,elmax+1);
    if (ios && layers%2==0) run_shader(02,elmax+2);
    if (rev) run_shader(03,elmax+3);

    //if (n2w(m2n(m))=='') stackImg.image(cam_input,0,0,stackImg.width,stackImg.height); 
    //else 
    stackImg.image(imgX,0,0); 
}

function run_shader(element,layer) {

  if (allow_feedback.includes(element)) {
    flayer = layer;
  }

  shdX.setUniform('Ra', Ra[layer]);
  shdX.setUniform('Rb', Rb[layer]);
  shdX.setUniform('Rc', Rc[layer]);
  shdX.setUniform('Rw', Math.random());
  shdX.setUniform('chan', floor(element/10));  
  shdX.setUniform('mode', fract(element/10)*10);
  shdX.setUniform('slowdown', layer>flayer ? 1 : 0);
  
  shdX.setUniform('imc_input', cam_input);
  shdX.setUniform('imf_input', stackImg);
  shdX.setUniform('img_input', layer == 1 ? cam_input : imgX);

  
  if (allow_fx.includes(element)) {
    fx(element,layer);
    shdX.setUniform('imz_input', imgZ);
  }
  
  if (allow_blur.includes(element)) {
    fx(element,layer);
    tinyImg.image(layer == 1 ? cam_input : imgX,0,0,tinyImg.width,tinyImg.height); 
    tinyImg.filter(BLUR, 1.5);
    shdX.setUniform('imt_input', tinyImg);
  }
  
  shdX.setUniform('time', time);
  shdX.setUniform('kFPS', kFPS);
  shdX.setUniform('fade', fade);
  
  shdX.setUniform('width', width);
  shdX.setUniform('height', height);
  shdX.setUniform('quality', quality);
  
  noSmooth();
  
  imgX.shader(shdX);
  imgX.rect(0,0,1,1);	
  
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function fx(n, layer) {

  if (n==74 || n==73) {
    
    charray = "1234567890 qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM ~!@#$%&()[]<>?/".split('');
    
    let xpoint = floor(Math.random()*width);
    let ypoint = floor(Math.random()*height);
    let size = floor(Math.random()*min(width,height)/4);
    
    let c = (layer==1 ? cam_input : imgX).get(xpoint,ypoint);
    let type = floor(map(Rc[layer], 0, 1, 0, 3));
    //print(type);
    
    if (type==0) {
      imgZ.clear();
      imgZ.noStroke();
      imgZ.fill(c);
      imgZ.textAlign(CENTER, CENTER);
      imgZ.textSize(size);
      imgZ.text(random(charray),xpoint,height-ypoint);
    }
    
    if (type==1) {
      imgZ.clear();
      imgZ.noStroke();
      imgZ.fill(c);
      imgZ.rectMode(CENTER);
      imgZ.rect(xpoint, height-ypoint, size, size);
    }
    
    if (type==2) {
      imgZ.clear();
      imgZ.noStroke();
      imgZ.fill(c);
      imgZ.circle(xpoint, height-ypoint, size);
    }
    
    //imgZ.image(loadImage('https://picsum.photos/400'),Math.random()*imgZ.width,Math.random()*imgZ.height);
    
    //img0 = imgZ;
  }  
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
