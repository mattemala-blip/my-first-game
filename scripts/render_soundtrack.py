import numpy as np,wave
rate=22050;duration=900;n=duration*rate;mix=np.zeros(n);rng=np.random.default_rng(52)
# 72 BPM, 54 bars, exactly three minutes. Six arranged sections develop the theme.
beat=60/72
roots=[0,5,3,7,0,3,5,7]
melody=[0,3,7,10,7,3,5,7,0,3,12,10,7,5,3,7,5,8,12,15,12,8,7,5,3,7,10,14,10,7,5,3]
# Five original themes: Moonlit Trail, Elven Lanterns, Mountain Watch,
# Forgotten Kingdom, and Homeward Stars. Each is exactly 54 bars / 180 seconds.
progressions=[[0,5,3,7,0,3,5,7],[5,0,7,3,5,3,0,7],[0,7,5,3,0,5,7,3],[3,5,0,7,3,0,5,7],[0,3,5,7,5,3,7,0]]
melodies=[
 melody,
 [7,10,12,15,12,10,7,5,7,12,10,7,5,3,5,7,12,15,19,15,12,10,12,7,10,7,5,3,5,7,10,7],
 [0,0,7,5,3,5,7,10,7,5,3,0,3,7,5,3,5,7,12,10,7,5,3,5,7,10,7,3,0,3,5,0],
 [3,7,10,7,5,3,0,3,7,10,14,10,7,5,3,0,5,8,12,8,7,5,3,5,10,7,5,3,0,3,7,3],
 [12,10,7,3,5,7,10,12,15,12,10,7,5,3,7,10,7,5,3,0,3,5,7,12,10,7,5,3,7,5,3,0]
]
def add(time,sound):
 indices=(round(time*rate)+np.arange(len(sound)))%n;np.add.at(mix,indices,sound)
def tone(time,pitch,length,volume,bell=False):
 t=np.arange(round(length*rate))/rate;freq=220*2**(pitch/12)
 env=np.minimum(t/.08,1)*np.exp(-t/(length*.32))*np.minimum((length-t)/.1,1)
 signal=np.sin(2*np.pi*freq*t)+(.2 if bell else [.09,.17,.06,.12,.14][track])*np.sin(2*np.pi*freq*2*t)*np.exp(-t*2)
 add(time,signal*env*volume)
for global_bar in range(270):
 track=global_bar//54;bar=global_bar%54
 roots=progressions[track];melody=melodies[track]
 # Intro, main theme, open landscape, brighter theme, quiet bridge, homecoming.
 section=0 if bar<6 else 1 if bar<18 else 2 if bar<30 else 3 if bar<42 else 4 if bar<48 else 5
 root=roots[(bar//2)%len(roots)];start=global_bar*4*beat
 if bar>=48:root=[5,3,7,5,7,0][bar-48]
 padVolume=.035 if section in [0,4] else .043
 for interval in [0,3,7,10]:tone(start,root+interval-12,4.1,padVolume)
 if section!=0 or bar>=3:tone(start,root-24,2.8,.10)
 for k in range(4):
  i=bar*4+k;time=(global_bar*4+k)*beat
  if section not in [0,4] or k%2==0:
   pitch=melody[i%32]+(12 if section!=3 else 15)
   tone(time,pitch,[1.6,1.8,1.4,2.0,1.7][track],.075 if section!=4 else .055)
   tone(time+.24,pitch,1.2,.017)
  if section in [2,3] and k in [1,3]:tone(time+.46,root+[7,10][k//2]+12,1.5,.028,True)
  drums=section in [1,2,3,5] or (section==0 and bar>=4)
  if drums:
   if k%2==0:
    t=np.arange(round(.25*rate))/rate;phase=2*np.pi*(43*t+65*.035*(1-np.exp(-t/.035)))
    add(time,.17*np.sin(phase)*np.exp(-t/.055))
   else:
    t=np.arange(round(.15*rate))/rate;noise=rng.uniform(-1,1,len(t));noise=np.convolve(noise,np.ones(8)/8,'same')
    add(time+.025,.11*noise*np.exp(-t/.035))
# Notes crossing the boundary wrap into the introduction, keeping the loop continuous.
mix=np.tanh(mix*1.3);mix*=.73/max(np.max(np.abs(mix)),.01)
# A tiny seam smoothing avoids sample discontinuity without a silent gap.
seam=round(rate*.005);mid=(mix[0]+mix[-1])/2
mix[:seam]=mid+(mix[:seam]-mid)*np.linspace(0,1,seam)
mix[-seam:]=mid+(mix[-seam:]-mid)*np.linspace(1,0,seam)
with wave.open('/tmp/rune-suite.wav','wb') as f:
 f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes((mix*32767).astype('<i2').tobytes())
