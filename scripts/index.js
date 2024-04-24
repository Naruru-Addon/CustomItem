import { world, system, ItemStack, ItemTypes } from "@minecraft/server";
import { form } from "./form";

system.afterEvents.scriptEventReceive.subscribe(ev => {
    const { sourceEntity, id, message } = ev;

    if (id == "g:i") {
        let test = [false, false];
        for (const property in getProperty(message)) {
            if (property == "id") test[0] = true; 
            if (property == "amo") test[1] = true;
        };
        if (test[0] && test[1]) getItem(sourceEntity,id,getProperty(message));
    } else if (id == "s:i") {
        let test = [false, false, false];
        for (const property in getProperty(message)) {
            if (property == "id") test[0] = true; 
            if (property == "amo") test[1] = true;
            if (property == "slot") test[2] = true;
        };
        if (test[0] && test[1] && test[2]) getItem(sourceEntity,id,getProperty(message));
    };
});

world.beforeEvents.chatSend.subscribe(ev => {
    const { sender, message } = ev;

    if (message == "ci") {
        ev.cancel = true;
        if (sender.hasTag("op") || sender.isOp) {
            system.run(() => {
                new form(sender).menu(true);
            });
        } else sender.sendMessage("§f[§bCI§f] 使用する権限がありません。");
    };
});

function getProperty(str) {
    const regex = /"([^"]*)":"([^"]*)"/g;
    const matches = {};

    let match;
    while ((match = regex.exec(str)) !== null) {
        matches[match[1]] = match[2];
    };
    
    return matches;
};

function getItem(player,idtype,str) {
    let item;
    const datas = {
        id: "",
        amo: "1",
        name: "",
        lore: "",
        slot: "",
        candestroy: "",
        canplace: "",
        lockmode: "",
        enchant: "",
    };

    for (const property in str) {
        for (const data in datas) {
            if (data == property) {
                datas[data] = str[property];
            };
        };
    };

    item = new ItemStack(ItemTypes.get(datas.id), parseFloat(datas.amo));

    if (datas.name != "") item.nameTag = datas.name;
    if (datas.lore != "") {
        const lore = [];
        if (datas.lore.includes(`,`)) {
            for (let i = 0; i < datas.lore.split(`,`).length; i++) lore.push(datas.lore.split(`,`)[i]);
        } else lore.push(datas.lore);
        item.setLore(lore);
    };
    if (datas.lockmode != "") {
        const lockmode = [];
        if (datas.lockmode.includes(`,`)) {
            for (let i = 0; i < datas.lockmode.split(`,`).length; i++) lockmode.push(datas.lockmode.split(`,`)[i]);
        } else lockmode.push(datas.lockmode);
        for (const mode of lockmode) {
            if (mode === "inventory") item.lockMode = "inventory";
            else if (mode === "slot") item.lockMode = "slot";
            else if (mode === "keepdeath") item.keepOnDeath = true;
        };
    };
    if (datas.candestroy != "") {
        const candestroy = [];
        if (datas.candestroy.includes(`,`)) {
            for (let i = 0; i < datas.candestroy.split(`,`).length; i++) candestroy.push(datas.candestroy.split(`,`)[i]);
        } else candestroy.push(datas.candestroy);
        item.setCanDestroy(candestroy);
    };
    if (datas.canplace != "") {
        const canplace = [];
        if (datas.canplace.includes(`,`)) {
            for (let i = 0; i < datas.canplace.split(`,`).length; i++) canplace.push(datas.canplace.split(`,`)[i]);
        } else canplace.push(datas.canplace);
        item.setCanPlaceOn(canplace);
    };
    if (datas.enchant != "") {
        const enchants = [];
        if (datas.enchant.includes(`,`)) {
            for (let i = 0; i < datas.enchant.split(`,`).length; i++) enchants.push(datas.enchant.split(`,`)[i]);
        } else enchants.push(datas.enchant);
        const enchantments = item?.getComponent("minecraft:enchantable");
        if (enchantments) {
            for (const enchant of enchants) {
                try{
                    enchantments.addEnchantment({ type: enchant.split(".")[0], level: Number(enchant.split(".")[1]) });
                }catch{
                    player.sendMessage("§f[§bCI§f] エンチャントIDまたはエンチャントレベルが正しくありません。");
                    return;
                };
            };
        };
    };
    if (idtype == "g:i") player.getComponent('minecraft:inventory').container.addItem(item);
    else if (idtype == "s:i") player.getComponent('minecraft:inventory').container.setItem(Number(datas.slot),item);
};