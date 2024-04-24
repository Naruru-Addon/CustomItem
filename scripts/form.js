import { world, system, ItemTypes } from "@minecraft/server";
import * as UI from "@minecraft/server-ui";
 
export class form {
    constructor(player){
        this.player = player;
    };

    async menu(busy,formdata,err){
        const FORMS = {
            menu: new UI.ModalFormData()
            .title("コマンド作成フォーム")
            .textField(`${err === undefined ? "" : `§c${err}§f\n`}変更しない場合は入力しないでください\n\nアイテムID\n※拡張子まで入力`,"minecraft:grass",formdata == undefined ? "" : formdata[0])
            .textField("個数","1",formdata == undefined ? "" : formdata[1])
            .textField("スロット\n※s:iの時のみ","0",formdata == undefined ? "" : formdata[2])
            .textField("アイテムの名前","test",formdata == undefined ? "" : formdata[3])
            .textField("アイテムの説明","test,test",formdata == undefined ? "" : formdata[4])
            .textField("アイテムの壊せるブロック","minecraft:grass,minecraft:stone",formdata == undefined ? "" : formdata[5])
            .textField("アイテムの置けるブロック","minecraft:grass,minecraft:stone",formdata == undefined ? "" : formdata[6])
            .textField("エンチャント","fire_aspect.1",formdata == undefined ? "" : formdata[7])
            .dropdown("ロックモード",["なし", "inventory", "slot", "keepdeath"],formdata == undefined ? 0 : formdata[8])
            .dropdown("タイプ",["g:i", "s:i"],formdata == undefined ? 0 : formdata[9])
        };

        const data = ["id", "amo", "slot", "name", "lore", "candestroy", "canplace", "enchant", "lockmode"];
        const lockmode = ["なし", "inventory", "slot", "keepdeath"];

        const { formValues, canceled } = busy
        ? await formbusy(this.player, FORMS.menu)
        : await FORMS.menu.show(this.player);
        if (canceled) return;
        let newdata = formValues;
        if (!formValues[0]) return this.menu(this.player,newdata,"アイテムIDが入力されていません");
        if (!formValues[0].includes(":")) return this.menu(this.player,newdata,"アイテムIDに拡張子を入力してください");
        if (!ItemTypes.get(formValues[0])) return this.menu(this.player,newdata,"入力されたアイテムIDが見つかりませんでした");
        if (!formValues[1]) return this.menu(this.player,newdata,"個数が入力されていません");
        if (!Number(formValues[1])) return this.menu(this.player,newdata,"個数に数字を入力してください");
        if (formValues[9] === 1) if (!formValues[2]) return this.menu(this.player,newdata,"スロットを入力してください");
        if (formValues[9] === 1) if (!Number(formValues[2]) && parseInt(formValues[2]) !== 0) return this.menu(this.player,newdata,"スロットに数字を入力してください");

        let command = "/scriptevent "
        if (formValues[9] == 0) {
            if (formValues[0] != "" && formValues[1] != "") {
                command += `g:i {`;
                for (let i = 0; i < formValues.length; i++) {
                    if (i == 9 || i == 2 || formValues[i] == "") continue;
                    if (i == 8) {
                        command += `"${data[i]}":"${lockmode[formValues[i]]}",`;
                        continue;
                    };
                    command += `"${data[i]}":"${formValues[i]}",`;
                };
                command += `}`;
            };
        } else if (formValues[9] == 1) {
            if (formValues[0] != "" && formValues[1] != "" && formValues[2] != "") {
                command += `s:i {`;
                for (let i = 0; i < formValues.length; i++) {
                    if (i == 9 || formValues[i] == "" || formValues[i] == "なし") continue;
                    if (i == 8) {
                        command += `"${data[i]}":"${lockmode[formValues[i]]}",`;
                        continue;
                    };
                    command += `"${data[i]}":"${formValues[i]}",`;
                };
                command += `}`;
            };
        };

        command = command.replace(/,([^,]*)$/, '$1');
        this.view(this.player,command);
    };

    async view(player,command) {
        const form = new UI.ModalFormData()
        form.title("確認")
        .textField("生成コマンド","",command)
        const { formValues, canceled } = form.show(player);
    };
};


function formbusy(player,form) {
    return new Promise(res => {
        system.run(async function run() {
            const response = await form.show(player);
            const {canceled, cancelationReason: reason} = response;
            if(canceled && reason === UI.FormCancelationReason.UserBusy) return system.run(run);
            res(response);
        });
    });
};