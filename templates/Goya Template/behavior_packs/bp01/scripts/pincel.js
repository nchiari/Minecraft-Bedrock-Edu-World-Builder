import { world, system, Player } from "@minecraft/server";


////////////////////////////////////////////////////
// Funciones y listeners de los pinceles
////////////////////////////////////////////////////
// Handle projectile hitting a block
world.afterEvents.projectileHitBlock.subscribe(eventData => {
  handleProjectileHit(eventData);
});

// Handle projectile hitting an entity
world.afterEvents.projectileHitEntity.subscribe(eventData => {
  handleProjectileHit(eventData);
});

function handleProjectileHit(eventData) {
  const projectile = eventData.projectile;
  const hitBlockLocation = eventData.location;
  const eventDimension = eventData.dimension;
  const source = eventData.source;
  const entityHit = eventData.entityHit;

  if (projectile.typeId === "let:projectile") {
    const block = eventDimension.getBlock(hitBlockLocation);
    const variantNumber = projectile.getComponent("minecraft:variant")?.value;

    // Pincel de light
    if (block && variantNumber === 0) {
      source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} light_block ["block_light_level"=10] replace air`);
      source.runCommand(`summon let:light_marker ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z}`);

    }

    // Pincel de block
    else if (block && variantNumber === 2) {
      // Llama a la función de abajo que permite también ser ejecutada por un comando
      blockPlacer(hitBlockLocation, source);
    }

    // Pincel de red
    else if (block && variantNumber === 3) {
      source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} red_concrete replace let:ink_red`);
      source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y - 1} ${hitBlockLocation.z - 1} ${hitBlockLocation.x + 1} ${hitBlockLocation.y + 1} ${hitBlockLocation.z + 1} red_concrete replace let:ink_red`);
      /*       source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z - 1} ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z + 1} red_concrete replace let:ink_red`);
            source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x + 1} ${hitBlockLocation.y} ${hitBlockLocation.z} red_concrete replace let:ink_red`); */
    }

    // Pincel de green
    else if (block && variantNumber === 6) {
      source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} lime_concrete replace let:ink_green`);
      source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y - 1} ${hitBlockLocation.z - 1} ${hitBlockLocation.x + 1} ${hitBlockLocation.y + 1} ${hitBlockLocation.z + 1} lime_concrete replace let:ink_green`);
      /*       source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y - 1} ${hitBlockLocation.z - 1} ${hitBlockLocation.x} ${hitBlockLocation.y + 1} ${hitBlockLocation.z + 1} lime_concrete replace let:ink_green`);
            source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y} ${hitBlockLocation.z - 1} ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z + 1} lime_concrete replace let:ink_green`);
            source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x + 1} ${hitBlockLocation.y} ${hitBlockLocation.z} lime_concrete replace let:ink_green`); */
    }

    // Pincel de orange
    else if (block && variantNumber === 7) {
      source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} orange_concrete replace let:ink_orange`);
      source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y - 1} ${hitBlockLocation.z - 1} ${hitBlockLocation.x + 1} ${hitBlockLocation.y + 1} ${hitBlockLocation.z + 1} orange_concrete replace let:ink_orange`);
      /*       source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y - 1} ${hitBlockLocation.z} ${hitBlockLocation.x} ${hitBlockLocation.y + 1} ${hitBlockLocation.z} orange_concrete replace let:ink_orange`);
            source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z - 1} ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z + 1} orange_concrete replace let:ink_orange`);
            source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x + 1} ${hitBlockLocation.y} ${hitBlockLocation.z} orange_concrete replace let:ink_orange`); */
    }

    // Pincel de purple
    else if (block && variantNumber === 8) {
      source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} purple_concrete replace let:ink_purple`);
      source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y - 1} ${hitBlockLocation.z - 1} ${hitBlockLocation.x + 1} ${hitBlockLocation.y + 1} ${hitBlockLocation.z + 1} purple_concrete replace let:ink_purple`);
      /*       source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z - 1} ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z + 1} purple_concrete replace let:ink_purple`);
            source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x + 1} ${hitBlockLocation.y} ${hitBlockLocation.z} purple_concrete replace let:ink_purple`); */
    }

    // Pincel de ink
    else if (variantNumber === 1) {
      if (block) {
        source.runCommand(`summon let:ink_marker ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z}`);
      } else if (entityHit?.entity?.typeId === "let:monster_bat") {
        const hitEntityLocation = entityHit.entity.location;
        source.runCommand(`summon let:ink_marker ${hitEntityLocation.x} ${hitEntityLocation.y} ${hitEntityLocation.z}`);
      }
    }

    // Pincel de memory
    else if (variantNumber === 9) {
      if (block) {
        if (source instanceof Player && source.hasTag("ending")) {
          source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y - 5} ${hitBlockLocation.z - 5} ${hitBlockLocation.x} ${hitBlockLocation.y + 5} ${hitBlockLocation.z + 5} air replace stripped_cherry_log`);
          source.runCommand(`fill ${hitBlockLocation.x - 1} ${hitBlockLocation.y - 5} ${hitBlockLocation.z - 5} ${hitBlockLocation.x + 1} ${hitBlockLocation.y + 5} ${hitBlockLocation.z + 5} air replace cherry_button`);
        } else {
          source.runCommand(`summon let:memory_marker ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z}`);
        }
        source.runCommand(`summon let:memory_marker ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z}`);
      } else if (entityHit?.entity?.typeId === "pix:human_goya") {
        const hitEntityLocation = entityHit.entity.location;
        source.runCommand(`summon let:memory_marker ${hitEntityLocation.x} ${hitEntityLocation.y} ${hitEntityLocation.z}`);
      }
    }
  }
};


////////////////////////////////////////////////////////////////////
// Función del pincel bloque (que se puede triggerear por comando)
////////////////////////////////////////////////////////////////////
function blockPlacer(hitBlockLocation, source) {
  source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x - 1} ${hitBlockLocation.y} ${hitBlockLocation.z + 1} let:clouds replace air`);
  source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x + 1} ${hitBlockLocation.y} ${hitBlockLocation.z - 1} let:clouds replace air`);
  source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x - 1} ${hitBlockLocation.y} ${hitBlockLocation.z - 1} let:clouds replace air`);
  source.runCommand(`fill ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z} ${hitBlockLocation.x + 1} ${hitBlockLocation.y} ${hitBlockLocation.z + 1} let:clouds replace air`);
  source.runCommand(`summon let:block_marker ${hitBlockLocation.x} ${hitBlockLocation.y} ${hitBlockLocation.z}`);
};

system.afterEvents.scriptEventReceive.subscribe((event) => {
  if (event.id === "let:blockTimer") {
    const source = event.sourceEntity;
    if (source) {
      const hitBlockLocation = source.location;
      blockPlacer(hitBlockLocation, source);
    }
  } else if (event.id === "let:cancel_block_projectile") {
    const source = event.sourceEntity;
    if (!(source instanceof Player)) return;
    const inventory = source.getComponent("minecraft:inventory")?.container;
    const itemStack = inventory?.getItem(source.selectedSlotIndex);
    if (itemStack?.typeId === "let:pincel_block") {
      blockProjectileOnce(source, NO_PROJECTILE_SWEEPS_PICKER);
    }
  }
});

//////////////////////////////////////////////////////
// Evento de interacciones con el pincel picker
//////////////////////////////////////////////////////
function handleBrushInteraction(source, block) {
  if (!(source instanceof Player) || !block) return;

  const inventory = source.getComponent("minecraft:inventory")?.container;
  const itemStack = inventory?.getItem(source.selectedSlotIndex);
  if (!itemStack) return;

  if (itemStack.typeId === "let:pincel_picker") {
    if (block.typeId === "let:maceta_flores_rojas") {
      source.runCommandAsync("function zaragoza/pinceles/red");
    } else if (block.typeId === "let:maceta_flores_azules") {
      source.runCommandAsync("function zaragoza/pinceles/blue");
    } else if (block.typeId === "let:maceta_flores_amarillas") {
      source.runCommandAsync("function zaragoza/pinceles/yellow");
    } else if (block.typeId === "let:maceta_flores_negras") {
      source.runCommandAsync("function zaragoza/pinceles/black");
    }
    // Memorias
    else if (block.typeId === "let:cama_block") {
      source.runCommandAsync("function fuendetodos/memorias/memoria_cama_on");
    } else if (block.typeId === "let:leche_block") {
      source.runCommandAsync("function fuendetodos/memorias/memoria_leche_on");
    } else if (block.typeId === "let:estatua_block") {
      source.runCommandAsync("function fuendetodos/memorias/memoria_estatua_on");
    } else if (block.typeId === "let:cofre_goya") {
      source.runCommandAsync("function fuendetodos/memorias/memoria_cofre_on");
    }

    // Pincel red
  } else if (itemStack.typeId === "let:pincel_red") {
    if (block.typeId === "let:maceta_flores_azules") {
      source.runCommandAsync("function zaragoza/pinceles/purple");
    } else if (block.typeId === "let:maceta_flores_amarillas") {
      source.runCommandAsync("function zaragoza/pinceles/orange");
    } else if (block.typeId === "let:cubo_de_agua") {
      source.runCommandAsync("function zaragoza/pinceles/picker");
    }

    // Pincel blue
  } else if (itemStack.typeId === "let:pincel_blue") {
    if (block.typeId === "let:maceta_flores_rojas") {
      source.runCommandAsync("function zaragoza/pinceles/purple");
    } else if (block.typeId === "let:maceta_flores_amarillas") {
      source.runCommandAsync("function zaragoza/pinceles/green");
    } else if (block.typeId === "let:cubo_de_agua") {
      source.runCommandAsync("function zaragoza/pinceles/picker");
    }

    // Pincel yellow
  } else if (itemStack.typeId === "let:pincel_yellow") {
    if (block.typeId === "let:maceta_flores_rojas") {
      source.runCommandAsync("function zaragoza/pinceles/orange");
    } else if (block.typeId === "let:maceta_flores_azules") {
      source.runCommandAsync("function zaragoza/pinceles/green");
    } else if (block.typeId === "let:cubo_de_agua") {
      source.runCommandAsync("function zaragoza/pinceles/picker");
    }

    // Pincel orange
  } else if (itemStack.typeId === "let:pincel_orange") {
    if (block.typeId === "let:cubo_de_agua") {
      source.runCommandAsync("function zaragoza/pinceles/picker");
    }

    // Pincel purple
  } else if (itemStack.typeId === "let:pincel_purple") {
    if (block.typeId === "let:cubo_de_agua") {
      source.runCommandAsync("function zaragoza/pinceles/picker");
    }

    // Pincel green
  } else if (itemStack.typeId === "let:pincel_green") {
    if (block.typeId === "let:cubo_de_agua") {
      source.runCommandAsync("function zaragoza/pinceles/picker");
    }

    // Pincel ink
  } else if (itemStack.typeId === "let:pincel_ink") {
    if (block.typeId === "let:cubo_de_agua") {
      source.runCommandAsync("function zaragoza/pinceles/picker");
    }

    // Pincel memorias
  } else if (itemStack.typeId === "let:pincel_memory") {
    if (block.typeId === "let:estatua_block") {
      source.runCommandAsync("function fuendetodos/memorias/memoria_estatua_on");
    } else if (block.typeId === "let:leche_block") {
      source.runCommandAsync("function fuendetodos/memorias/memoria_leche_on");
    } else if (block.typeId === "let:cofre_goya") {
      source.runCommandAsync("function fuendetodos/memorias/memoria_cofre_on");
    } else if (block.typeId === "let:cama_block") {
      source.runCommandAsync("function fuendetodos/memorias/memoria_cama_on");
    }
  }
}

// Reutiliza la misma lógica para ataques (mouse) e interacciones táctiles.
world.afterEvents.entityHitBlock.subscribe(({ damagingEntity: source, hitBlock: block }) => {
  handleBrushInteraction(source, block);
});

const BLOCKED_PROJECTILE_BLOCKS = new Set([
  "let:cubo_de_agua",
  "let:maceta_flores_amarillas",
  "let:maceta_flores_azules",
  "let:maceta_flores_negras",
  "let:maceta_flores_rojas",
  "let:estatua_block",
  "let:cama_block",
  "let:leche_block",
  "let:cofre_goya"
]);

const NO_PROJECTILE_RADIUS = 3;
const NO_PROJECTILE_SWEEPS = [1, 2];
const NO_PROJECTILE_SWEEPS_PICKER = [1, 2, 3, 4];

function isPincelItem(itemStack) {
  return itemStack?.typeId?.startsWith("let:pincel_");
}

function blockProjectileOnce(source, sweeps = NO_PROJECTILE_SWEEPS) {
  if (!(source instanceof Player)) return;
  for (const delay of sweeps) {
    system.runTimeout(() => {
      if (!source.isValid()) return;
      const dimension = source.dimension;
      const location = source.location;
      const projectiles = dimension.getEntities({
        type: "let:projectile",
        location,
        maxDistance: NO_PROJECTILE_RADIUS
      });
      for (const projectile of projectiles) {
        projectile.triggerEvent("let:despawn");
      }
    }, delay);
  }
}

world.beforeEvents.itemUseOn.subscribe(({ source, block }) => {
  const inventory = source.getComponent("minecraft:inventory")?.container;
  const itemStack = inventory?.getItem(source.selectedSlotIndex);
  if (block && isPincelItem(itemStack) && BLOCKED_PROJECTILE_BLOCKS.has(block.typeId)) {
    const sweeps =
      itemStack.typeId === "let:pincel_picker" ? NO_PROJECTILE_SWEEPS_PICKER : NO_PROJECTILE_SWEEPS;
    blockProjectileOnce(source, sweeps);
  }
  handleBrushInteraction(source, block);
});
