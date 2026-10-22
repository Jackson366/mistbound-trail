import type { GameState } from "../types";

interface Character {
  name: string;
  role: string;
  opening: string;
  returning: string;
  followUp: string;
  goodbye: string;
  topics: [label: string, reply: string][];
}
export const characters: Record<string, Character> = {
  "0:mara": {
    followUp: "干粮还是三枚金币换四份。你还要补给，还是问问回程？",
    name: "玛拉",
    role: "鹿灯酒馆掌柜",
    opening: "路上的干粮备齐了吗？三枚金币能换四份。你要补给，还是想问问回程？",
    returning: "又见面了，锅里还温着汤。要补些干粮，还是聊聊回程？",
    goodbye: "行，先去忙吧。鹿角灯会为归人留着。",
    topics: [
      [
        "回程该留多少补给？",
        "每走一格要一份，回程有几格就至少留几份；谨慎绕行和野外休整也会用到。别把最后一份吃完才往回走。",
      ],
    ],
  },
  "0:cartographer": {
    followUp: "我们接着看这张图。要确认印记位置，还是归程？",
    name: "奥伦",
    role: "制图师",
    opening: "这张图上缺了三处星光。你想先问印记的位置，还是找到之后该怎么做？",
    returning: "地图还在这里。要重看印记的位置，还是确认归程？",
    goodbye: "愿你的下一笔，落在回家的路上。",
    topics: [
      [
        "三枚印记在哪里？",
        "沉星祭坛、旧王墓窟、无灯孤塔，各存一枚。先走相邻地块揭开迷雾，到地方再调查。",
      ],
      [
        "找到印记后该做什么？",
        "找齐三枚，带回地图中央的烛溪村，再亲手把星盘交给我，我们就能一起补全归路。一路先留足回程的干粮。",
      ],
    ],
  },
  "0:courier": {
    followUp: "信还在这儿。接着问学者，还是那封信？",
    name: "信使",
    role: "刚从孤塔归来",
    opening: "你也要往无灯孤塔去？想听学者的习惯，还是问这封信？",
    returning: "信还没寄出去。你想听孤塔的事，还是信的事？",
    goodbye: "走的时候轻些，别让门外的雾进来。",
    topics: [
      [
        "学者为什么不点灯？",
        "他说墨水会记住影子，书也别随意挪动。我只管送信，解释得再多也不懂。",
      ],
      [
        "信为什么没有寄出？",
        "落款只有一枚星纹，没有名字。我等一个认得它的人，暂时还没等到。",
      ],
    ],
  },
  "9:monk": {
    followUp: "名册和彩窗都在。你想接着问哪一个？",
    name: "塞恩",
    role: "白枝修道院修士",
    opening: "坐一会儿吧。你想看看名册，还是问彩窗上缺掉的星瓣？",
    returning: "温水放在老地方。今天想看名册，还是聊彩窗？",
    goodbye: "愿你有路可走，也有名字被人记住。",
    topics: [
      [
        "名册记录了什么人？",
        "每一个借宿的人，不论身份。历史总偏爱王的名字，可道路是普通人走出来的。",
      ],
      [
        "彩窗为什么缺了三瓣？",
        "那图案比修道院更古老，三处古迹各自保存了一部分。我记下传说，却不能替你证实。",
      ],
    ],
  },
  "14:captain": {
    followUp: "你还想问过关的规矩，还是旧旗？",
    name: "蕾雅",
    role: "暮色守卫队长",
    opening: "路还通着。你要问关口的规矩，还是旧王的旗？",
    returning: "又经过这里了。问规矩，还是问旗上的旧纹样？",
    goodbye: "沿路走，别在雾里抄近道。",
    topics: [
      [
        "过关有什么规矩？",
        "收好武器，别挡归人的路。我们守道路，不守王位；从墓窟回来的人，最好先回村歇一歇。",
      ],
      [
        "为什么换掉旧王旗？",
        "王位空了，道路还得有人守。旧布能用便留下，王冠却不必再挂着。",
      ],
    ],
  },
  "16:scholar": {
    followUp: "说回书室里的事。你想问印记，还是暗处的墨迹？",
    name: "维恩",
    role: "星图学者",
    opening: "别挪那本书，月光正落在页边。你想问印记，还是这些不点灯的书？",
    returning: "星仪还在转。你想继续谈印记，还是暗处的墨迹？",
    goodbye: "给后来的人留一点光，也留一点问题。",
    topics: [
      [
        "三枚印记有什么用？",
        "它们不是武器，也不预言谁会成为王。三部分记录的是同一条回家的航线。",
      ],
      [
        "为什么不用灯看书？",
        "有些墨迹只在暗处显现，灯亮了，字反而消失。把书留在原处就好。",
      ],
    ],
  },
  "18:hunter": {
    followUp: "先别急着走。要再认认路标，还是聊扎营？",
    name: "艾达",
    role: "边境猎人",
    opening: "别踩火塘边的细草。你想认路标，还是问在野外怎么歇脚？",
    returning: "绳结还是那个结。想重认路标，还是聊聊扎营？",
    goodbye: "记住安全的地方，天黑前再走一遍归路。",
    topics: [
      [
        "苦艾路标是什么意思？",
        "挂苦艾的地方能避风，可以停一停。记住安全的地方，比只记着危险有用。",
      ],
      [
        "在野外休整要留什么？",
        "留一份补给，再留两段时间，能养回四点生命。路标只是提醒，休整还得你自己决定。",
      ],
    ],
  },
};

export function openingFor(s: GameState, id: string, returning: boolean) {
  if (id === "0:mara" && s.sigils === 3)
    return "三处星光都在你行囊里了。先坐下喝口热汤，奥伦一直在窗边等你。";
  if (id === "0:courier" && s.letterStage === "carrying")
    return "你从孤塔回来了。维恩……有没有提起过这封信？";
  if (id === "0:courier" && s.letterStage === "delivered")
    return "信已经收好了。谢谢你把他的话带回来，今夜我会替他留灯。";
  if (id === "16:scholar" && s.letterStage === "heard")
    return "你看着我袖口的星纹，像是有什么话想问。村里有人还认得这个记号？";
  if (id === "0:cartographer" && s.sigils > 0)
    return `你带回了 ${s.sigils} 枚印记。${
      s.sigils < 3
        ? `我把${s.tiles
            .filter((t) => t.sigil && t.searched)
            .map((t) => t.name)
            .join(
              "、",
            )}标在图上了。还差 ${3 - s.sigils} 枚，我们看看接下来的路。`
        : "三处星光终于相聚。把星盘放到这里吧，这段归路该由你亲手补全。"
    }`;
  if (id === "0:mara" && s.food === 0)
    return "行囊里连干粮都空了？三枚金币能换四份。先补给，还是商量回程？";
  return returning ? characters[id].returning : characters[id].opening;
}

export function dialogueContext(s: GameState, id: string) {
  if (id === "0:cartographer")
    return `${s.sigils}:${s.tiles
      .filter((t) => t.sigil && t.searched)
      .map((t) => t.id)
      .join(",")}`;
  if (id === "0:mara") return `${s.sigils}:${s.food === 0}`;
  if (id === "0:courier" || id === "16:scholar")
    return s.letterStage ?? "unknown";
  return "local";
}

export function topicReply(s: GameState, id: string, index: number) {
  if (id === "0:cartographer" && index === 0 && s.sigils > 0) {
    const remaining = s.tiles
      .filter((t) => t.sigil && !t.searched)
      .map((t) => t.name);
    return remaining.length
      ? `已经取回的星位我都记下了。还要去${remaining.join("、")}。你愿意先走哪一处，就先把那段路留在图上。`
      : "三处星位已经齐了。把星盘交给我，我们一起补上通往村灯的最后一笔。";
  }
  if (id === "0:cartographer" && index === 1 && s.sigils === 3)
    return "你已经回到烛溪村了。等你准备好，把星盘放在这张图中央，这次远征就算完成。";
  if (id === "0:courier" && index === 1 && s.letterStage === "delivered")
    return "它不必再寄出去了。你带回的话，比纸上的落款更清楚。我会在门外留一盏灯。";
  if (id === "16:scholar" && index === 1)
    return "有些墨迹只在暗处显现，灯亮了，字反而消失。书上写着“三转一停，停时取星”。先看看中央星仪，你就能认出那段间隙。";
  if (id === "18:hunter" && index === 0)
    return "挂苦艾的地方能避风。认得它之后，在灰松林或这座营地扎营，花一份补给、两段时间，能恢复六点生命。记住安全的地方，比只记着危险有用。";
  if (id === "18:hunter" && index === 1)
    return "野外歇脚要留一份补给、两段时间，一般能恢复四点生命。认得苦艾以后，在灰松林或这里的背风处就能恢复六点。";
  if (id === "14:captain" && index === 0 && s.tiles[12].searched)
    return "这枚印记上的墓尘还没擦净。你已经走过旧王墓窟了。路仍开着，顺着村灯的方向走，归人不必再向旧王报到。";
  return characters[id].topics[index][1];
}
