execute as @a[x=107,y=69,z=388,dx=0,dy=2,dz=0] run tag @s add construction
execute as @a[x=107,y=69,z=388,dx=0,dy=2,dz=0] run fill 106 69 389 106 69 388 air
execute as @a[x=107,y=70,z=388,dx=0,dy=2,dz=0] run fill 106 69 389 106 69 388 air
clear @a[x=106,y=70,z=388,dx=0,dy=2,dz=0,tag=construction]
give @a[x=106,y=70,z=388,dx=0,dy=2,dz=0,tag=construction] let:dea 5
execute as @a[x=106,y=70,z=388,dx=0,dy=2,dz=0] run tag @s remove construction
gamemode c @a[x=107,y=69,z=388,dx=0,dy=2,dz=0,tag=construction]
gamemode a @a[x=106,y=70,z=388,dx=0,dy=2,dz=0,tag=!construction]