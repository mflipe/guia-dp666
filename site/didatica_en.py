"""Plain-language explanation of each option, in English: what it does, why it helps and when it is (or isn't) worth using.

English counterpart of didatica.py, with the same keys and structure. Each entry has: faz (what the option does),
util (the problem it solves), quando (decision lines, each with a bold start and the rest of the sentence),
obs (a caveat about the source) and tag (who it matters to). The keys of OFICIAL are the Portuguese names, the
same ids the tools use in both languages; the texts quote the English labels of each firmware.
"""

TAGS = {
    "ajuste": "Worth changing",
    "dx": "For DX",
    "gosto": "Personal taste",
    "padrao": "Leave at default",
    "especial": "Special use",
    "na": "Not for the DP-666",
}

GLOSSARIO = [
    ("DX", "listening to distant or weak stations, from other cities or countries."),
    ("RDS", "digital data an FM station sends along with the audio: name (PS), text (RT), station code (PI), "
            "program type (PTY), time (CT) and alternative frequencies (AF)."),
    ("dBµV", "unit of the signal strength reaching the antenna. Below 20 is weak; above 50, strong."),
    ("AGC", "automatic gain control: the radio lowers its own amplification when the signal is strong, to avoid overload."),
    ("Squelch", "mutes the audio when there is no signal, so you don’t hear hiss."),
    ("Softmute", "gradually lowers the volume as the signal gets worse."),
    ("Screen noise", "every screen refresh creates electrical interference that the tuner picks up. That is why several "
                     "options talk about refreshing the screen less."),
]


def D(faz, util="", *quando, tag=None, obs=""):
    return {"faz": faz, "util": util, "quando": [list(q) for q in quando], "tag": tag, "obs": obs}


def S(t):
    return ("Worth it if", t)


def N(t):
    return ("Not worth it if", t)


def U(rotulo, t):
    return (rotulo, t)


# ---------------------------------------------------------------- concepts shared by both firmwares
def modelo(portatil_toque, outros):
    return D(f"Tells the firmware what type of radio it is running on: {outros}.",
             "The same firmware runs on different builds. The model turns touch, the battery reading and "
             "features that only exist on each type on or off.",
             U(f"Use {portatil_toque}", "on the DP-666, which is the factory setting."),
             U("Only change it if", "another model was chosen by mistake and touch or the battery reading stopped working."),
             tag="padrao")


def squelch(on, off, auto, oficial=False):
    return D(f"The squelch mutes the audio when there is no useful signal, so you don’t hear hiss between stations. "
             f"{on} uses the radio’s SQL knob. {auto} decides on its own from the signal quality.",
             "It makes scanning and switching stations more comfortable: the sound only opens when there is a station.",
             U(f"Use {on} if", "you want to set the threshold by turning the SQL knob."),
             U(f"Use {auto} if", "you want silence between stations without adjusting anything."),
             U(f"Use {off} if", "you are looking for weak stations: any squelch can mute a signal you could still understand."),
             tag="dx",
             obs="On Auto, the criterion is the same as the FM and AM Scan sensitivity." if oficial else "")


def fm_agc(maximo):
    return D("Sets the signal strength at which the radio starts lowering its own amplification on FM.",
             "High amplification hears weak signals, but very strong stations can overload the input and create "
             "ghost stations: mixes that show up on frequencies where there is no station.",
             U(f"Use {maximo} if", "you are far from the towers or looking for weak signals. It is the most sensitive setting."),
             U("Lower it to 87 or 84 if", "you live near strong transmitters, use an external antenna and hear ghost "
                                         "stations or mixing noise."),
             tag="dx")


def am_agc():
    return D("The same as FM AGC, on AM and shortwave: the signal strength at which the radio lowers its own "
             "amplification.",
             "It keeps a very strong AM station from overloading the input and showing up on other frequencies.",
             U("Leave it at the default if", "you notice no problems."),
             U("Lower it if", "a strong local station shows up spread over several frequencies or drowns out the others."),
             tag="dx")


def bandas_fm(fm, outra, nome_outra):
    return D(f"Chooses which FM bands the BAND button cycles through: {fm}, {outra} or both.",
             "Taking a band you don’t use out of the cycle saves presses of BAND.",
             U(f"In Brazil, use only {fm}:", f"with the edges at 76.1 and 108 MHz, extended FM is already inside it. {nome_outra}"),
             tag="gosto")


def spi(valores, auto, oficial=False):
    extra = ("Try fixed values if", "you hear whistles on an extended FM or AM frequency: outside 87.5 to 108 MHz, "
             "Auto always uses the same speed.") if oficial else \
            ("Try other values if", "you hear whistles that go away when the screen stops refreshing.")
    return D(f"Changes the speed of the link between the processor and the screen ({valores}). "
             f"On {auto}, the radio picks the speed according to the tuned frequency.",
             "Every screen refresh creates electrical noise, which can land on top of a station as a whistle. "
             "Changing the speed moves that noise somewhere else.",
             U(f"Use {auto}", "day to day: a table picks the speed for each FM frequency." if oficial
               else "day to day."),
             U(*extra),
             tag="padrao")


def volume(faixa):
    return D(f"Internal audio gain of the tuner ({faixa}), applied before the volume knob.",
             "It exists for radios built without a volume knob. On the DP-666, which has one, it only changes the base level.",
             U("Leave it at 0 dB", "in most cases: too much gain distorts, and too little makes you turn the volume up more."),
             tag="padrao")


def mpx(stereo):
    return D("In MPX mode, the left channel is mono and the right one carries the station’s full signal, with the "
             "stereo pilot and RDS.",
             "It lets you analyze the signal on a computer, by connecting the headphone output to a sound card and "
             "using MPX or RDS software.",
             U(f"Use {stereo}", "to listen normally."),
             U("Only use MPX if", "you are going to analyze the signal. On headphones, the right side becomes noise."),
             tag="especial")


def estereo(off):
    return D("Below this signal strength, the radio reduces stereo separation and moves toward mono.",
             "Stereo needs much more signal than mono to sound clean. With a weak signal, mono removes a good part "
             "of the hiss.",
             U("Use around 40 dBµV if", "you listen to weak or distant stations and the hiss bothers you."),
             U(f"Leave it at {off} if", "you only listen to strong local stations."),
             tag="ajuste")


def highcut_freq():
    return D("When the treble cut kicks in, it attenuates the sound above this frequency.",
             "The hiss of a weak signal sits in the treble. Cutting it makes voices cleaner, with a more muffled sound.",
             U("Lower it, to around 3000 Hz, if", "you want the most hiss reduction on very weak signals."),
             U("Leave it high if", "you prefer a more open sound."),
             tag="dx")


def highcut_lim(off):
    return D("Below this signal strength, the treble cut kicks in.",
             "It turns the treble cut on only when the signal is weak, without touching the sound of good stations.",
             U("Use 30 to 40 dBµV if", "you listen to weak stations and the hiss bothers you."),
             U(f"Leave it at {off} if", "you prefer to hear everything as it arrives, including to recognize a station by its sound."),
             tag="dx")


def desenfase(c50, c75, off):
    return D("The station boosts the treble when transmitting (pre-emphasis), and the radio cuts it by the same "
             "amount when receiving. The sound returns to natural and the hiss drops.",
             "The value must match the station’s. If it is higher, the sound gets muffled; if it is lower or off, "
             "it gets shrill and hissier.",
             U(f"Use {c50}", "in Brazil, which follows the European standard."),
             U(f"Only use {c75} if", "you are in the United States or another country that uses that standard."),
             U(f"Only use {off} if", "you are going to analyze the signal: for listening, the sound gets shrill."),
             tag="ajuste")


def brilho():
    return D("Screen brightness, from 1 to 100%.",
             "Less brightness uses less battery and is less bothersome in the dark.",
             U("Lower it if", "you listen at night or want the battery to last longer."),
             U("Raise it if", "you use the radio outdoors, in the sun."),
             tag="gosto")


def protecao(tempos):
    return D(f"After {tempos} seconds without use, the screen turns off or dims.",
             "It saves battery and removes the screen’s electrical noise while you just listen, which helps with weak signals.",
             S("you listen without looking at the screen, for example in bed."),
             N("you want to follow RDS and the clock all the time."),
             tag="gosto")


def tema(n):
    return D(f"Color scheme of the interface. There are {n} themes.", "", U("Tip:", "dark themes are easier on the eyes at night."),
             tag="gosto")


def fonte():
    return D("Font of the large frequency digits.", tag="gosto")


def rds_erros(oficial):
    if oficial:
        faz = ("Sets how many errors the radio accepts in the RDS data: Off accepts only perfect blocks, Small "
               "accepts small corrected errors and Large accepts even large corrected errors.")
        q = (U("Use Small", "day to day: it is the balance between speed and accuracy."),
             U("Use Large if", "you look for weak stations and want to see RDS even with wrong letters."),
             U("Use Off if", "you only want reliable data, for example to log a station."))
        obs = ""
    else:
        faz = ("Sets how many errors the radio accepts in the RDS data: Small accepts small corrected errors, Large "
               "accepts bigger errors and All accepts everything.")
        q = (U("Use Small", "day to day: it is the balance between speed and accuracy."),
             U("Use Large or All if", "you look for weak stations and want to see RDS even with wrong letters."))
        obs = "Explanation from the base code; the Mod17 manual only lists the values."
    return D(faz, "With a weak signal, almost no data block arrives perfect. Accepting more errors shows the name and "
                  "the text sooner, with a higher risk of a wrong letter.", *q, tag="dx", obs=obs)


def regiao(europa, eua):
    return D("Adapts RDS to the region: the program type (PTY) table and, in the United States and Canada, the "
             "conversion of the station code into a call sign, such as KXYZ.",
             "The European and the American tables give different names to the same number: type 5 is Education in "
             "Europe and Rock in the United States. In the wrong region, the program type shows up wrong.",
             U(f"Use {europa}", "in Brazil: Brazilian RDS follows the European model."),
             U(f"Use {eua} or Canada", "only in those countries."),
             tag="ajuste")


def sublinhado(ps_only, on):
    return D(f"Replaces spaces with underscores: only in the station name ({ps_only}) or also in the text ({on}).",
             "It shows exactly how many spaces the station sends, which helps tell similar names apart and log the "
             "name exactly.",
             S("you log distant stations and want to copy the name precisely."),
             N("you just want to read the name and the text: the underscores clutter the screen."),
             tag="dx")


def rds_filtro(on):
    return D("Runs the RDS data through a filter with memory before showing it.",
             "The name and the text become steadier, with fewer wrong letters on a weak signal, at the cost of a "
             "little delay.",
             U(f"Leave it {on}", "day to day."),
             U("Turn it off if", "you want to see the raw data, as fast as possible, accepting errors."),
             tag="padrao")


def pi_erros():
    return D("Shows the station’s PI code even before it arrives without errors.",
             "The PI identifies the station. In DX, seeing it early, even uncertain, helps you find out who you are hearing.",
             S("you look for weak stations and want quick clues."),
             N("you only want a confirmed PI, with no chance of a mistake."),
             tag="dx")


def af(off, reg):
    return D(f"With AF on, the radio switches on its own to another frequency of the same station when the signal "
             f"gets worse. With {reg}, it only accepts frequencies with the same regional programming.",
             "On a trip, it keeps the same station playing while you move from one region to another.",
             S("you listen on the move to a network that broadcasts its list of alternative frequencies."),
             U(f"Use {off} if", "you are hunting for stations or doing DX: the radio may jump frequency without you asking. "
                                "Without an AF list from the station, the option does nothing."),
             tag="ajuste")


def rt_buffer():
    return D("Only shows the RadioText, the text that scrolls on the screen, once it arrives complete, instead of "
             "changing it letter by letter.",
             "It avoids seeing the old message mixed with the new one while the station changes the text.",
             U("Leave it on", "day to day."),
             U("Turn it off if", "you want to see the text appear as early as possible on a weak signal."),
             tag="padrao")


def af_sort():
    return D("Sorts the list of alternative frequencies (AF) from lowest to highest.",
             "It makes the list easier to read on the AF screen.", tag="gosto")


def ps_longo():
    return D("Shows the station’s long name (Long PS), up to 32 characters, when it broadcasts one.",
             "The full name appears, instead of the 8 letters of the regular name.",
             U("Leave it on:", "it only appears when the station sends it, and few stations do."),
             tag="gosto")


def fast_ps(off, inicial, sempre, oficial=True):
    q = [U(f"Use {inicial}", "day to day: a fast name when you change stations and a steady one afterwards.")]
    if sempre:
        q.append(U(f"Use {sempre} if", "the station changes the name on the screen every few seconds and you want to "
                                      "follow it, accepting wrong letters on a weak signal."))
    if off:
        q.append(U(f"Use {off} if", "you only want to see confirmed letters."))
    return D(f"Shows the letters of the station name (PS) as soon as they arrive, without waiting for confirmation. "
             f"{inicial} does this only until the name is complete" + (f"; {sempre}, all the time." if sempre else "."),
             "The name shows up faster when you change stations.", *q, tag="gosto",
             obs="" if oficial else "The Mod17 manual only confirms the Initial value; the explanation comes from the base code.")


def conversor():
    return D("Adds a value to the displayed frequency, for those using an external RF converter.",
             "A converter brings another band, such as an amateur radio band, into the radio’s range. With the right "
             "value, the screen shows the real frequency.",
             U("Leave it at 0 if", "you don’t use a converter. With a value other than 0, the radio turns AF off."),
             tag="especial")


def borda_baixa(oficial):
    q = [U("In Brazil, use 76.1 MHz", "to cover extended FM, from 76.1 to 87.3 MHz. With a 200 kHz step, tuning "
                                      "stops only on Brazilian channels."),
         U("Use 87.5 MHz if", "you don’t want extended FM in the way of the knob.")]
    if oficial:
        q.append(U("To get there:", "the edge goes up 0.1 MHz in one direction of the encoder and down 1 MHz in the "
                                    "other. From 87.5, go down 12 times, to 75.5, and up 6."))
    return D("Lowest frequency of the FM band. Past it, the knob wraps around to the end of the band.",
             "It fits the band to your country and avoids going through frequencies with no stations.", *q, tag="ajuste")


def borda_alta():
    return D("Highest frequency of the FM band. Past it, the knob wraps around to the low edge.", "",
             U("Use 108.0 MHz:", "the last Brazilian channel is 107.9."), tag="padrao")


def nivel_offset(faixa):
    return D(f"Adds or subtracts decibels from the signal reading{faixa}.",
             "It compensates for an amplifier, an attenuator or a long cable between the antenna and the radio, so "
             "the reading shows the real signal at the antenna. Since the squelch and the thresholds use this "
             "reading, they change with it.",
             S("you added an amplifier or attenuator to the antenna and want readings comparable to other listeners’."),
             U("Leave it at 0 if", "you only use the radio’s own antenna."),
             tag="especial")


def nivel_baixo(oficial):
    return D("Below this signal strength, the radio grays out the modulation meter and the RDS labels.",
             "It is a visual warning that the signal is too weak to trust what appears on the screen.",
             U("Leave it at the minimum,", "−15 dBµV, day to day: the warning almost never shows up."),
             U("Raise it if", "you want the warning whenever the signal gets weak."),
             tag="padrao", obs="" if oficial else "Explanation from the base code.")


def softmute_fm(on, off):
    return D("Gradually lowers the volume as the signal weakens and the hiss rises.",
             "It avoids bursts of hiss when the signal fluctuates, for example while walking with the radio.",
             U(f"Use {on} if", "you listen on the move or don’t want to be startled by hiss."),
             U(f"Use {off} if", "you look for weak stations: softmute lowers exactly what you want to hear."),
             tag="dx")


def softmute_am(on, off):
    return D("Gradually lowers the volume as the AM signal weakens and the noise rises.",
             "On AM the noise is harsher, and softmute makes listening less tiring.",
             U(f"Leave it {on}", "day to day."),
             U(f"Use {off} if", "you are trying to make out a weak station at night: it lowers exactly that signal."),
             tag="dx")


def noise_blanker(banda):
    if banda == "fm":
        util = "On FM this noise is less bothersome than on AM, but it shows up on weak signals."
    else:
        util = "On AM and shortwave this noise is common and can cover the station."
    return D("Cuts impulse noise: the short clicks from motors, electric fences and electrical appliances. "
             "The percentage is the strength of the cut.", util,
             S("you hear regular clicks that don’t come from the station. Start at 50% and go up little by little."),
             N("the noise is a continuous hiss: the blanker only acts on impulses and, set too high, distorts the sound."),
             tag="dx")


def passo_fm(c200, c100, c50):
    return D("How far the frequency moves with each click of the knob on FM.",
             "In Brazil, channels are every 200 kHz. With this step, each click lands on a possible station; with "
             "smaller steps, there are extra clicks on empty frequencies.",
             U(f"Use {c200}", "with the low edge at 76.1 MHz, to step only through Brazilian channels."),
             U(f"Use {c100} if", "you also want to go through the even decimals, for example looking for stations off the grid."),
             U(f"Use {c50} if", "you need fine tuning, for example to move away from a strong station next door."),
             tag="ajuste")


def fmsi():
    return D("Turns on processing that improves stereo on weak signals. It only exists on the TEF6687 and TEF6689 "
             "tuners.", "",
             U("On the DP-666 it does nothing:", "its tuner is the TEF6686."),
             tag="na")


def sens_busca(banda, faixa, oficial=True):
    extra = (" Auto squelch and Auto memory use the same criterion." if banda == "FM" else
             " AM Auto squelch uses the same criterion.") if oficial else ""
    return D(f"How demanding the search is before stopping on a {banda} station{faixa}.",
             "Higher values stop on weaker, noisier signals; lower ones, only on clean signals." + extra,
             U("Raise it if", "the search skips stations you can hear."),
             U("Lower it if", "the search stops on empty frequencies or on hiss only."),
             tag="dx", obs="" if oficial else "The meaning of the numbers comes from the base code; check it on your radio.")


def onda_sw():
    return D("Shows which shortwave band you are in, in meters, such as 49 m or 31 m, next to the frequency.",
             "Shortwave stations cluster in these bands, and schedules use the meters.",
             U("Leave it on:", "it helps you find your way and doesn’t get in the way."), tag="gosto")


def cochannel(padrao):
    return D("Turns on the co-channel detector: the radio shows CO on the screen when it notices two stations on the "
             "same frequency. The number is the sensitivity.",
             "At night, distant AM stations arrive on the same frequency as local ones and cause a whistle. The "
             "warning shows that the interference comes from another station, not from the radio.",
             U(f"Leave it at {padrao}", "day to day."),
             U("Raise it if", "you want to know about any co-channel, even a weak one, accepting false alarms."),
             tag="dx")


def cochannel_lim():
    return D("How many detections in a row the co-channel detector needs before showing CO.",
             "Higher values avoid false alarms; lower ones warn faster.",
             U("Leave it at 3,", "which is the default."), tag="padrao")


def atenuador_am(nome_ganho):
    faz = "Attenuates the AM input by 6 to 36 dB."
    if nome_ganho:
        faz += (" The name talks about gain because the idea is that you enter the gain of your active antenna, and "
                "the radio attenuates by the same amount.")
    return D(faz, "An active antenna or a long wire can send too much signal and overload the radio: mixed stations "
                  "and whistles appear.",
             S("you use an active antenna or a long wire and hear ghost stations or distortion."),
             N("you use the telescopic antenna: attenuating only weakens the signal."),
             tag="especial")


def passo_am(c10, c9):
    return D("How far the frequency moves with each click on medium wave: 9 or 10 kHz.",
             "The Americas use AM channels every 10 kHz; Europe, Asia and Africa, every 9 kHz. With the wrong step, "
             "tuning never lands exactly on a station.",
             U(f"Use {c10}", "in Brazil and the rest of the Americas."),
             U(f"Use {c9} if", "you are going to listen at night to stations from other continents."),
             tag="ajuste")


def usb():
    return D("Chooses which computer program the USB port talks to: XDR-GTK or RDS Spy.",
             "XDR-GTK controls the radio from the computer, with a spectrum and RDS. RDS Spy decodes and logs RDS in "
             "detail.",
             U("Use XDRGTK", "to control the radio from the computer."),
             U("Use RDS Spy", "to study the stations’ RDS."),
             tag="especial")


def wifi():
    return D("Turns on the radio’s Wi-Fi.",
             "It is needed to set the time over the internet, send data to StationList and use XDR-GTK over the network.",
             S("you are going to use the internet or the network."),
             N("you won’t use it: Wi-Fi drains the battery and, on the DP-666, makes the battery reading disappear while it is on."),
             tag="especial")


def wifi_config():
    return D("Opens the wizard that connects the radio to a network.",
             "Once set up, the radio connects on its own whenever Wi-Fi is on.",
             U("Note:", "it only works with 2.4 GHz networks."), tag="especial")


def stationlist_ip(texto):
    return D(texto, "The radio sends the tuned station’s data to this computer, to build lists and logs in the "
                    "StationList program.",
             U("Ignore it if", "you don’t use StationList."), tag="especial")


def stationlist_id():
    return D("This radio’s number in StationList.", "It tells radios apart when more than one sends data to the same "
                                                     "computer.",
             U("Ignore it if", "you only have one radio."), tag="especial")


def canais_mem(only, exclude):
    return D(f"With {only}, the scan goes only through the memory channels of the range. With {exclude}, it scans the "
             f"whole band and skips the frequencies saved in that range.",
             f"{exclude} is great for DX: save your local stations and the scan only stops on new frequencies.",
             U(f"Use {only} if", "you want to watch a list of chosen frequencies."),
             U(f"Use {exclude} if", "you want to find new stations, without stopping on the ones you already know."),
             tag="dx")


def cancelar(off, pi, sinal, oficial=True):
    return D(f"Makes the scan stop on its own: when it decodes a station’s code ({pi}) or when it finds a signal "
             f"({sinal}). {off} never stops.",
             "You leave the scan running, and it stops when something shows up.",
             U(f"Use {pi} if", "you only want to stop on identifiable stations."),
             U(f"Use {sinal} if", "you want to stop on any signal" + (", using the threshold of the FM Scan sensitivity."
                                                                       if oficial else ".")),
             U(f"Use {off} if", "you want the scan to keep going and just log."),
             tag="dx")


def espera_sinal(on):
    return D("Uses the wait time only on frequencies with a signal; on empty ones, the scan moves on right away.",
             "The scan gets much faster without missing stations.",
             U(f"Leave it {on}", "day to day."), tag="padrao")


def calibrar_toque():
    return D("Opens the touch calibration: you tap the points shown on the screen.",
             "It fixes taps that land in the wrong place.",
             U("Use it when", "touch becomes inaccurate or after a factory reset."), tag="especial")


def inverter_knob():
    return D("Reverses the knob direction: turning right now lowers the frequency, and vice versa.",
             "Encoders on different builds turn the opposite way; this fixes the direction.",
             S("turning right lowers the frequency."), tag="padrao")


# ---------------------------------------------------------------- official firmware (key: Portuguese name on the radio)
OFICIAL = {
    "Seletor de modelo": modelo("Portable touch", "desktop (Base), portable with battery (Portable) or portable with a "
                                                 "touchscreen (Portable touch)"),
    "Inverter rotação": D("Reverses the encoder direction: turning right now lowers the frequency, and vice versa.",
                          "Encoders on different builds turn the opposite way. The DP-666 build already comes "
                          "reversed, so that turning right raises the frequency.",
                          S("turning right lowers the frequency."),
                          U("Shortcut:", "holding BW while powering on the radio also reverses the direction."), tag="padrao"),
    "Codificador óptico": D("Changes how the encoder pulses are counted to the pattern of optical encoders.",
                            "Optical encoders produce pulses in a different way. On the DP-666, which ships with the "
                            "standard mode, turning this on makes the knob erratic and without acceleration.",
                            U("Leave it off", "on the DP-666."), tag="padrao"),
    "Inverter cores": D("Inverts the screen colors, like a photo negative.",
                        "Some screen panels come with inverted color logic, and this fixes the image.",
                        S("the colors look swapped."), N("the screen looks normal, as on the DP-666."), tag="padrao"),
    "ARS display": D("Changes the size, orientation and color order of the screen to suit the panel of another build (ARS).",
                     "It exists for radios with another type of screen.",
                     U("Leave it off on the DP-666:", "when on, the image comes out rotated or with swapped colors."), tag="na"),
    "Medidor analógico": D("Puts the needle of an analog signal meter at the end of the scale, so you can adjust it.",
                           "Some homemade builds have a needle meter. The DP-666 doesn’t.",
                           U("Ignore it:", "on the DP-666 there is nothing to calibrate."), tag="na"),
    "Reposição de fábrica": D("Returns every setting to the factory default and erases the 99 memory channels. The radio "
                              "asks for confirmation.",
                              "It fixes odd behavior after an update or after changing many settings.",
                              U("Use it when", "the radio misbehaves and you don’t know which setting caused it."),
                              U("Before that,", "write down the memory channels you want to keep: they will be erased."), tag="especial"),
    "Parar tela de despertar ao sintonizar": D(
        "With the screensaver on, turning the knob now tunes without waking the screen. When off, the first turn "
        "only wakes the screen.",
        "You can change stations in the dark without lighting the screen, which drains the battery and creates noise "
        "the radio picks up.",
        S("you listen at night or want as little screen noise as possible on weak signals."),
        N("you want to see the frequency while tuning."), tag="gosto"),
    "Desligamento automático": D(
        "Puts the radio on standby after 15, 30, 60 or 90 minutes without you touching anything.",
        "It works as a sleep timer: if you fall asleep listening, the battery doesn’t run out.",
        S("you listen in bed or often forget the radio on."),
        N("you listen for hours without touching the radio, for example while recording a show: it turns off halfway."),
        tag="gosto"),
    "Usar squelch": squelch("On", "Off", "Auto", oficial=True),
    "FM AGC": fm_agc("92 dBµV"),
    "AM AGC": am_agc(),
    "Selecionar faixa FM": bandas_fm("FM", "OIRT", "OIRT, from 65.8 to 74 MHz, is an Eastern European band and has "
                                                   "no stations in Brazil."),
    "Selecionar faixa AM": D("Chooses which AM bands the BAND button cycles through: LW (long wave), MW (medium wave) and "
                             "SW (shortwave).",
                             "Taking a band you don’t use out of the cycle saves presses of BAND.",
                             U("In Brazil, MW and SW are enough:", "there are no long wave stations in the Americas."),
                             U("Leave only MW if", "you don’t listen to shortwave."), tag="gosto"),
    "Pressione o botão banda por 5 seg.": D(
        "Sets what happens when you hold BAND: put the radio on standby (Power off), turn off only the screen "
        "(Screen off) or nothing (Disabled).",
        "Turning off the screen while the radio plays saves battery and removes screen noise. It is great for "
        "listening in bed or hunting weak signals.",
        U("Use Screen off if", "you want a shortcut to listen with the screen off. Turn the knob to light it up."),
        U("Use Disabled if", "you often hold BAND by accident."), tag="gosto"),
    "Velocidade dinâmica de SPI": spi("10 to 60 MHz", "Auto", oficial=True),
    "Definir volume": volume("from −10 to +10 dB"),
    "Sinais sonoros": D("Turns on navigation sounds: beeps in the menu, at the end of the band and when saving to the "
                        "logbook. With On + morse, numbers and letters also play in Morse code.",
                        "It was designed so that blind or low-vision users can operate the radio by sound alone.",
                        S("you use the radio without looking at the screen or want audible confirmation."),
                        N("you listen in silence or record the audio: the beeps end up in the recording."), tag="gosto"),
    "Saída de áudio": mpx("Stereo"),
    "Limiar de separação estéreo": estereo("Off"),
    "Frequência do canto de corte alto": highcut_freq(),
    "Definir limiar de corte alto": highcut_lim("Off"),
    "Desênfase FM": desenfase("50 µs", "75 µs", "Off"),
    "Idioma": D("Language of the menus, among 23.", "",
                U("Tip:", "if you switch by mistake to a language you can’t read, Language is the first item of this group."),
                tag="gosto"),
    "Definir brilho da tela": brilho(),
    "Medidor de modulação": D("Turns on the bar that shows the station’s modulation, that is, the loudness of the "
                              "transmitted sound.",
                              "When it is off, the screen redraws less and creates less electrical noise, which helps "
                              "with weak signals.",
                              S("you want to compare the loudness of stations."),
                              N("you look for weak signals: the wiki recommends turning it off to reduce interference "
                                "from the screen."), tag="dx"),
    "Proteção de tela": protecao("3, 10, 30 or 60"),
    "Opções de proteção de tela": D("Sets what the screensaver does: turn off the screen or leave it at 1%, 25% or 50% "
                                    "brightness.",
                                    "Dimming keeps the information readable; turning off saves more.",
                                    U("Use Screen off if", "you want the most battery and silence."),
                                    U("Use 1% or 25% if", "you want to glance at the frequency and RDS in the dark."), tag="gosto"),
    "Opções de bateria": D("Shows the battery in volts, as a percentage, or not at all.",
                           "Voltage is the direct reading; the percentage is an estimate made from it.",
                           U("Use Show voltage if", "you want precision: full is around 4.2 V, almost empty around 3.3 V."),
                           U("Use Show percentage if", "you prefer a simple reading."),
                           U("Keep in mind that", "with Wi-Fi on the reading disappears: it is a limitation of the ESP32."), tag="gosto"),
    "Unidade de medidor de sinal": D("Unit in which the radio shows the signal strength.",
                                     "dBµV is the unit of the other menu settings, such as AGC and the thresholds, and "
                                     "the most used by DXers. dBf appears in American spec sheets; dBm, in measuring "
                                     "instruments.",
                                     U("Use dBµV", "to compare with the menu thresholds and with other listeners’ "
                                                   "reports."), tag="padrao"),
    "Mostrar relógio": D("Shows the time on the screen when the radio has the right time, received through RDS or the "
                         "internet.",
                         "", U("It stays hidden", "until the radio receives the time."), tag="gosto"),
    "Tema": tema(17),
    "Fonte de frequência": fonte(),
    "Rodar ecrã 180°": D("Turns the screen image upside down.",
                         "It is meant for builds with the screen mounted the other way around. The DP-666 build already "
                         "comes rotated the right way.",
                         U("Leave it on on the DP-666:", "when off, the image is upside down. Holding MODE while "
                                                          "powering on does the same."), tag="padrao"),
    "Teclado frequência": D("Turns on the on-screen numeric keypad, to enter the frequency.",
                            "It is the fastest way to reach a distant frequency, without turning the knob.",
                            N("you touch the screen by accident and the keypad gets in the way."), tag="gosto"),
    "Calibração da tela de toque": calibrar_toque(),
    "Mostrar erros RDS": rds_erros(True),
    "Região": regiao("Europe", "USA"),
    "Mostrar sublinhado no RDS": sublinhado("PS only", "On"),
    "Filtro RDS": rds_filtro("On"),
    "Mostrar erros PI": pi_erros(),
    "Usar AF": af("Off", "REG on"),
    "Buffering RT": rt_buffer(),
    "Classificar AF automaticamente": af_sort(),
    "PS rápido": fast_ps("Off", "Initial", "Always"),
    "Mostrar PS longo": ps_longo(),
    "Definir deslocamento do conversor": conversor(),
    "Definir borda da faixa baixa": borda_baixa(True),
    "Definir borda da faixa alta": borda_alta(),
    "Definir deslocamento de nível": nivel_offset(""),
    "Definir limiar de nível baixo": nivel_baixo(True),
    "Silenciamento suave FM": softmute_fm("On", "Off"),
    "Supressor de ruído FM": noise_blanker("fm"),
    "Passo padrão FM": passo_fm("200 kHz", "100 kHz", "50 kHz"),
    "FMSI melhoria do som estéreo": fmsi(),
    "Sensibilidade da varredura@Configurações FM": sens_busca("FM", ", from 1 to 30"),
    "Silenciamento suave AM": softmute_am("On", "Off"),
    "Supressor de ruído AM": noise_blanker("am"),
    "Deslocamento de nível de RF AM": nivel_offset(" on AM"),
    "Mostrar comprimento de onda SW": onda_sw(),
    "Detector CoChannel": cochannel("100%"),
    "Limiar do CoChannel Det": cochannel_lim(),
    "AM Ganho da antena": atenuador_am(True),
    "Tamanho padrão da etapa AM": passo_am("10 kHz", "9 kHz"),
    "Sensibilidade da varredura@Configurações AM": sens_busca("AM", ", from 1 to 30"),
    "Modo USB": usb(),
    "Wi-Fi": wifi(),
    "Configurar Wi-Fi": wifi_config(),
    "IP do cliente da lista de estações": stationlist_ip("Last number of the IP address of the computer running "
                                                         "StationList, on the same network as the radio."),
    "ID da lista de estações": stationlist_id(),
    "Tela mudo na conexão XDRGTK": D("Turns the radio’s screen off while XDR-GTK is connected.",
                                     "You already see everything on the computer. With the screen off, the radio uses "
                                     "less power and creates less noise.",
                                     S("you use XDR-GTK to hunt for stations."),
                                     N("you want to look at the radio and the computer at the same time."), tag="especial"),
    "Definir deslocamento de tempo NTP": D("Time zone applied to the time coming from the internet, which arrives in "
                                           "universal time (UTC).",
                                           "Without the right time zone, the clock is a few hours fast or slow.",
                                           U("Use GMT −3", "for Brasília time. Amazonas and Mato Grosso use GMT −4, "
                                                          "and Acre, GMT −5."), tag="ajuste"),
    "DST automático no horário NTP": D("Moves the clock 1 hour forward during daylight saving time, by the European rule: "
                                       "from the last Sunday of March to the last Sunday of October.",
                                       "It is for countries with daylight saving time. Brazil has had none since 2019.",
                                       U("In Brazil, turn it off:", "when on, the clock is 1 hour fast from March to "
                                                                    "October."), tag="ajuste"),
    "Modo de relógio": D("Shows the clock in 24 h or 12 h format.", tag="gosto"),
    "PI bloqueado CT sync": D("When turned on, the radio only accepts the RDS time from the station tuned at that "
                              "moment, identified by its PI code.",
                              "Some stations send the wrong time. By locking onto a trustworthy station, the clock "
                              "doesn’t change when you tune another one.",
                              S("you set the time through RDS and know a station with the right time. Turn it on "
                                "while tuned to that station."),
                              N("you set the time over the internet."), tag="gosto"),
    "Comece a pesquisar DX": D("Starts the DX scan: the radio goes through the chosen memory channels, or through the "
                               "band, looking for distant stations.",
                               "It automates the search, stops for the chosen time on each frequency and can log what "
                               "it finds on its own.",
                               U("Shortcut:", "outside the menu, press MODE until MEM appears, then BAND. While "
                                              "scanning, MEM blinks."), tag="dx"),
    "Comece a pesquisar canais de memória": D("First memory channel of the scan range.", "",
                                              U("Keep in mind that", "only FM and OIRT channels are included."), tag="dx"),
    "Pare de pesquisar canais de memória": D("Last memory channel of the scan range.", tag="dx"),
    "Tempo de espera": D("How long the radio stays on each frequency before moving on: 0.5 s or from 1 to 30 s.",
                         "More time gives a weak station’s RDS a chance to arrive; less time scans faster.",
                         U("Use 3 to 5 s if", "you want to identify the stations by their RDS."),
                         U("Use 0.5 to 1 s if", "you just want a quick pass to see what has a signal."), tag="dx"),
    "Canais memorizados": canais_mem("Only", "Exclude"),
    "Cancelar automatic. a pesquisa": cancelar("Off", "Correct PI", "Signal"),
    "Mudo áudio enquanto procura": D("Mutes the audio while scanning.", "It avoids the hiss between frequencies.",
                                     S("you leave the scan running and check the logbook later."),
                                     N("you want to hear what goes by."), tag="gosto"),
    "Registrador automático": D("Automatically saves to the logbook the stations with a correct PI found during the scan.",
                                "You come back later and see what was heard, with frequency and code.",
                                S("you leave the scan running without watching it."),
                                N("you prefer to log only what you confirm by ear."), tag="dx"),
    "Espera tempo apenas quando sinal": espera_sinal("On"),
    "Limpar livro de registro": D("Erases the whole logbook.", "",
                                  U("Before that,", "export the logbook if you want to keep it."), tag="especial"),
    "Iniciar memória automática": D("Scans the band in 100 kHz steps and saves to the memory channels the stations that "
                                    "pass the Scan sensitivity criterion.",
                                    "It fills the memory channels with your local stations in a few minutes.",
                                    U("Before that,", "choose the band and the range of memory channels below: the "
                                                      "channels in the range are overwritten."), tag="especial"),
    "Iniciar frequência": D("Start of the auto memory search.", "",
                            U("In Brazil,", "use 76.1 MHz to include extended FM."), tag="especial"),
    "Parar frequência": D("End of the auto memory search.", tag="especial"),
    "Iniciar canal de memória": D("First position auto memory may save to.",
                                  "Setting aside a range protects the memory channels you set up by hand.", tag="especial"),
    "Parar canal de memória": D("Last position auto memory may save to.", tag="especial"),
    "Somente armazenar com RDS": D("Only saves the stations where the radio detected RDS.",
                                   "It avoids saving frequencies with noise or with spurs from strong stations.",
                                   N("you want to include stations without RDS: not every station broadcasts it."), tag="gosto"),
    "Prevenir PI duplo": D("Doesn’t save a station whose PI code is already in memory: Range compares with the channels "
                           "of the range; Full, with all 99.",
                           "Networks that broadcast the same station on several frequencies don’t take up several "
                           "memory channels.",
                           S("there are repeaters of the same network in your region."),
                           N("you want to save every frequency, including the repeated ones."), tag="gosto"),
    "Sensibilidade da varredura@Memória automática": D(
        "It is the same setting as FM settings → Scan sensitivity: it decides how weak the signal can be for auto "
        "memory to save it.", "", U("Raise it if", "auto memory leaves out stations you can hear."),
        U("Lower it if", "it saves empty frequencies."), tag="dx"),
    "Limpar canais de memória": D("Erases the memory channels.", "", U("Before that,", "write down the ones you want to keep."), tag="especial"),
    "Sobre o software": D("Shows the credits of who developed the firmware."),
}

# ---------------------------------------------------------------- Megatron Mod17 (name on the radio)
LP = D("Chooses what a long press on this key does: lock the keys, the original function, open the menu, the keypad, "
       "the shortcuts page, advanced RDS or the AF screen.",
       "You can put the shortcuts you use most on the keys.",
       U("Tip:", "Lock&Unlock locks the keys, handy for carrying the radio on in a bag."), tag="gosto")

MOD17 = {
    "System usage mode": D("Simple mode hides the advanced menu options; Advanced mode shows all of them.",
                           "Simple mode keeps beginners from changing what they don’t know. Many options, including "
                           "those on the Brazil list, only appear in advanced mode.",
                           U("Use Advanced mode", "to set the radio up for Brazil and for DX."),
                           U("To turn it on,", "DEEPELEC recommends switching the language to 简体中文, choosing 高级模式 in "
                                               "主要设置 → 系统使用模式 and switching back to English."), tag="ajuste"),
    "Model selector": modelo("Portable touch", "desktop (Base), portable with battery (Portable) or portable with a "
                                               "touchscreen (Portable touch)"),
    "Set FM band": bandas_fm("FM", "FML", "FML is the low band chosen in Set FML band."),
    "Set AM band": D("Chooses which AM bands the BAND button cycles through: LW, MW, SW and AIR.",
                     "Taking a band you don’t use out of the cycle saves presses of BAND.",
                     U("In Brazil, MW and SW are enough:", "there is no long wave in the Americas, and the AIR band only "
                                                          "works with an external converter."), tag="gosto"),
    "Screensaver": protecao("3, 10, 30 or 60"),
    "Set first page": D("Chooses the screen that appears when the radio turns on.",
                        "If you always start from the keypad or the RDS screen, it saves a step.", tag="gosto"),
    "Power Off timer": D("Turns the radio off on its own after the chosen time, from 1 to 480 minutes.",
                         "It works as a sleep timer and avoids draining the battery if you forget the radio on.",
                         S("you listen in bed."),
                         N("you listen for hours on end, for example while recording: make sure it doesn’t turn off halfway."),
                         tag="gosto"),
    "Keep BAND key 3 sec.": D("Sets what happens when you hold BAND for 3 s: turn off (Power off), turn off only the "
                              "screen (Mute screen) or nothing (Disable).",
                              "Mute screen is a shortcut to listen with the screen off, which saves battery and removes "
                              "screen noise.",
                              U("Use Mute screen if", "you want that shortcut to listen in the dark."),
                              U("Use Disable if", "you often hold BAND by accident."), tag="gosto"),
    "Dynamic SPI speed": spi("from 5 to 70 MHz", "Auto"),
    "Auto still screen": D(
        "After the Still screen timer time without use, the screen freezes: it stays lit, showing the last image, but "
        "stops refreshing. When you touch the radio, it goes back to normal.",
        "Every screen refresh, such as the signal meter, RDS and the clock, creates electrical noise that the tuner "
        "picks up. With the screen frozen, that noise goes away without losing sight of the frequency, unlike the "
        "screensaver, which turns everything off.",
        S("you listen to weak stations, especially on AM and shortwave, and notice hiss or whistles that change "
          "when the screen moves."),
        N("you want to follow RDS, the signal meter and the clock: with the screen frozen, they don’t change."),
        U("To save battery,", "it helps little: the screen stays lit, and what uses the most power in it is the "
                              "backlight. Lower the brightness or use the screensaver."),
        tag="dx", obs="The manual doesn’t say what it is for; the explanation comes from how the radio works."),
    "Still screen timer": D("How many seconds without use until the screen freezes, from 0 to 120.",
                            "A short time freezes right after you tune; a long time lets you read RDS first.",
                            U("Use 10 to 30 s", "to read the station name before the screen stops."), tag="dx"),
    "Power off": D("Turns the radio off from the menu. To turn it back on, press BW.", tag="especial"),
    "Set volume": volume("from −60 to +24 dB"),
    "Audio output": mpx("Stereo"),
    "Stereo threshold": estereo("Off"),
    "High cut corner": highcut_freq(),
    "High cut threshold": highcut_lim("Off"),
    "Use squelch": squelch("On", "Off", "Auto"),
    "FM deemphasis": desenfase("50us", "75us", "Off"),
    "Beep at band edge": D("Plays a beep when tuning goes past the end of the band and wraps around to the start.",
                           "It tells you that you went around the band without having to look.",
                           N("you listen in silence or record the audio."), tag="gosto"),
    "Beep at operation": D("Plays a beep for every button press or knob turn.", "It confirms every command by sound.",
                           N("you listen in silence or record the audio: the beeps end up in the recording."), tag="gosto"),
    "Language": D("Menu language: English or Simplified Chinese.", "",
                  U("Tip:", "Chinese is also the way to turn on Advanced mode. Afterwards, switch back to English."),
                  tag="gosto"),
    "Brightness": brilho(),
    "Theme": tema(15),
    "Frequency font": fonte(),
    "Meter refresh interval": D("How often the signal meter refreshes, from 30 to 1000 ms.",
                                "Refreshing less often creates less screen noise and makes the reading calmer; more "
                                "often shows fast changes, like the signal going up and down.",
                                U("Increase it if", "you look for weak signals and want less screen noise."),
                                U("Decrease it if", "you want to see the signal react quickly, for example when aiming the antenna."),
                                tag="dx"),
    "Meter display style": D("Look of the signal meter: Classic or New.", tag="gosto"),
    "Set UI round": D("Chooses where the interface uses rounded corners: menu, buttons, icons or borders.", tag="gosto"),
    "Menu display style": D("Menu layout: the new one, vertical or horizontal, or the classic one.", tag="gosto"),
    "Show notification": D("Shows notifications on the screen, such as time synced or settings saved.", "",
                           N("the notifications get in the way of reading RDS."), tag="gosto"),
    "Notification mode": D("Where notifications appear: in a discreet bar (Message bar), in a box in the middle of the "
                           "screen (Message box) or wherever the radio decides (Auto).", tag="gosto"),
    "Clock, Debug info e Frequency name color": D("Colors of the clock, of the debug info and of the frequency name: a "
                                                  "fixed color or Dynamic.", tag="gosto"),
    "Show frequency tips": D("Shows a label next to the frequency: RDX, WEK, MED, STR or SPR. Judging by the names, they "
                             "look like signal strength classes: WEK (weak), MED (medium), STR (strong) and SPR (very "
                             "strong).", "",
                             U("Try it:", "if the label helps, keep it."), tag="gosto",
                             obs="The manual doesn’t explain it; the function was inferred from the firmware strings."),
    "My logo image": D("Replaces the startup screen image with a file of your own, in JPG, BMP or PNG.", tag="gosto"),
    "My logo border": D("Frame around the startup screen logo.", tag="gosto"),
    "Power saving mode": D("Turns on a power saving mode. The radio tells you when it enters and leaves it.",
                           "It should make the battery last longer.",
                           U("Try it if", "you want more battery: turn it on and see whether something stops working or updating."),
                           tag="gosto", obs="The firmware doesn’t say what changes in this mode."),
    "Show RDS errors": rds_erros(False),
    "Region": regiao("Europe", "USA"),
    "RDS Show underscore": sublinhado("PS only", "On"),
    "RDS filter": rds_filtro("On"),
    "Show PI errors": pi_erros(),
    "Use AF": af("Off", "REG On"),
    "RT buffering": rt_buffer(),
    "Auto sort AF": af_sort(),
    "Show long PS": ps_longo(),
    "Fast PS": fast_ps("", "Initial", "", oficial=False),
    "Show RDS clock": D("Shows on the screen the time the station sends through RDS.",
                        "It is for checking the station’s time. It doesn’t set the radio’s clock: that is RDS time sync.",
                        tag="gosto"),
    "Disable all RDS": D("Turns off all RDS decoding.",
                         "It makes the screen cleaner, with just the frequency and the signal, for those who only want to listen.",
                         S("you want a clean screen."), N("you want to see station names."), tag="gosto"),
    "Set converter offset": conversor(),
    "Set low band edge": borda_baixa(False),
    "Set high band edge": borda_alta(),
    "Set level offset": nivel_offset(""),
    "Set low level threshold": nivel_baixo(False),
    "Softmute FM": softmute_fm("On", "Off"),
    "FM Noise blanker": noise_blanker("fm"),
    "FM default stepsize": passo_fm("200 kHz", "100 kHz", "50 kHz"),
    "FM AGC": fm_agc("92 dBµV"),
    "FMSI stereo improve": fmsi(),
    "Set FML band": D("Sets the low FM band (FML) that BAND offers: 65 to 74 MHz, the Eastern European OIRT, or "
                      "76 to 87 MHz.",
                      "The 76 to 87 MHz option covers almost all of Brazilian extended FM (76.1 to 87.3 MHz).",
                      U("Use 76–87 MHz if", "you prefer extended FM as a separate band on BAND."),
                      U("It doesn’t matter if", "FML is out of the cycle in Set FM band."), tag="gosto"),
    "Softmute AM": softmute_am("On", "Off"),
    "AM Noise blanker": noise_blanker("am"),
    "AM RF Level offset": nivel_offset(" on AM"),
    "Show SW wavelength": onda_sw(),
    "CoChannel Detector sensitivity": cochannel("100%"),
    "CoChannel Detector threshold": cochannel_lim(),
    "AM ATT": atenuador_am(False),
    "AM AGC": am_agc(),
    "MW default stepsize": passo_am("10 kHz", "9 kHz"),
    "AIR band Conversion": D("Frequency of the external air band converter’s oscillator, in MHz.",
                             "The DP-666 doesn’t receive the air band (118 to 137 MHz) on its own. With a converter, "
                             "this value makes the screen show the real frequency.",
                             U("Ignore it if", "you don’t have the converter."),
                             U("Before listening,", "check the listening rules in Setup for Brazil."),
                             tag="especial"),
    "AIR start frequency": D("Where the AIR band starts, in MHz.", "", U("Ignore it if", "you don’t have the converter."),
                             tag="especial"),
    "USB mode": usb(),
    "Wi-Fi active": wifi(),
    "Configure Wi-Fi": wifi_config(),
    "Set XDRGTK password": D("Password XDR-GTK needs to control the radio over the network.",
                             "It keeps someone else on the network from taking over the radio.",
                             U("Set a password if", "you use XDR-GTK over the network."), tag="especial"),
    "Stationlist client IP": stationlist_ip("IP address of the computer running StationList."),
    "Stationlist ID": stationlist_id(),
    "Screen off on XDRGTK": OFICIAL["Tela mudo na conexão XDRGTK"],
    "Wi-Fi auto disconnect": D("Turns Wi-Fi off after the chosen time, or right after setting the clock (After "
                               "time sync).",
                               "Wi-Fi drains the battery and, on the DP-666, makes the battery reading disappear while it is on.",
                               U("Use After time sync if", "you only turn Wi-Fi on to set the clock."), tag="ajuste"),
    "Set NTP server": D("Internet time server. It comes set to cn.pool.ntp.org, in China.",
                        "A server close to you answers faster.",
                        U("In Brazil, use a.st1.ntp.br,", "from NTP.br, which uses the atomic clocks of the National "
                                                          "Observatory. Elsewhere, use your country’s pool.ntp.org server."), tag="ajuste"),
    "Bluetooth": D("Turns on Bluetooth so the radio can control another device (Config slave host).",
                   "According to the firmware, it lets one radio command another. There is no documentation.",
                   U("It is not for", "headphones or speakers: it doesn’t carry audio."), tag="especial"),
    "Touch type": D("How the firmware reads the touchscreen: by interrupt (Int33 or Int27) or by periodic polling "
                    "(Polling). Off disables touch.",
                    "If touch doesn’t respond or responds wrongly, another type may fix it. The setup wizard asks you "
                    "to pick one that works.",
                    U("Only change it if", "touch doesn’t work."),
                    U("Use Off if", "you don’t use touch and want to avoid accidental taps."), tag="padrao"),
    "Touch calibration": calibrar_toque(),
    "Rotary adjust squelch": D("Lets you adjust the squelch threshold by turning the tuning knob, in a mode you turn "
                               "on and off.",
                               "Useful if you prefer the knob to the SQL control.",
                               N("you prefer the radio’s SQL knob."), tag="gosto"),
    "Knob mode": D("Knob operating mode: Classic or New.", "",
                   U("Try", "both and keep the one that feels more natural."), tag="gosto",
                   obs="The manual doesn’t explain the difference."),
    "Knob reverse": inverter_knob(),
    "Knob acceleration": D("Speeds up tuning when you turn the knob fast: Medium or Fast.",
                           "It crosses the band without dozens of clicks.",
                           N("you make fine adjustments and the jump gets in the way."), tag="gosto"),
    "Quickly switch menu": D("Shortcut to switch menu groups in fewer steps.", tag="gosto",
                             obs="The manual doesn’t detail how the shortcut works."),
    "Long press Rotary key": LP,
    "Long press BW key": LP,
    "Long press MODE key": LP,
    "Long press BAND key": LP,
    "Auto save change": D("Saves menu changes on its own. With Off, the radio asks Save or Discard when you exit.",
                          "Asking avoids saving a change made by accident.",
                          U("Use Off if", "you often try settings out and want to decide when you exit."), tag="gosto"),
    "Set date and time": D("Sets the date and time by hand.",
                           "Useful without Wi-Fi. On radios with an internal clock (RTC), the time stays right with the "
                           "radio off.", tag="gosto"),
    "12/24 h": D("Shows the clock in 12 h or 24 h format.", tag="gosto"),
    "Set local time zone": D("Time zone applied to the time coming from the internet, as GMT±hh:mm.",
                             "Without the right time zone, the clock shows China time (GMT+8), which Megatron ships with.",
                             U("Use GMT−03:00", "for Brasília time. Amazonas and Mato Grosso use GMT−04:00, and "
                                                "Acre, GMT−05:00. Elsewhere, use your own offset."), tag="ajuste"),
    "NTP time sync": D("Sets the clock over the internet when Wi-Fi is on; since Mod16, every 30 minutes.",
                       "It is the most accurate way to keep the right time.",
                       S("you have Wi-Fi set up."), N("you don’t use Wi-Fi: there is no way to sync."),
                       tag="ajuste"),
    "RDS time sync": D("Sets the clock from the time the station sends through RDS.",
                       "It works without internet, but depends on the station sending the right time.",
                       U("Use Off if", "you set the time over the internet: some stations send the wrong time and "
                                       "would put the clock out."),
                       U("Use On if", "you don’t have Wi-Fi and the station you listen to sends the right time."), tag="ajuste"),
    "Sleep clock correction": D("Corrects the clock by a few seconds every 24 hours.",
                                "With the radio on standby, the ESP32 clock runs a little fast or slow each day; this "
                                "compensates for the difference.",
                                S("the clock is always off by the same amount and you use neither NTP nor an internal clock (RTC)."),
                                tag="gosto"),
    "Power on timer": D("Turns the radio on by itself at a set time.", "It works as a radio alarm clock.", tag="gosto"),
    "Low battery protect": D("Turns the radio off when the battery reaches the chosen limit.",
                             "Discharging a lithium battery too far shortens its life.",
                             U("Leave it on:", "it protects the battery."), tag="padrao"),
    "Delete RDS dictionary": D("Erases the RDS dictionary stored by the radio.", tag="especial",
                               obs="Deleted and Not deleted are just states; they don’t confirm that anything was "
                                   "erased. The manual doesn’t explain what the dictionary stores."),
    "System information": D("Shows the firmware version, the build date, memory, storage, the tuner, the time server, "
                            "the IP address and the MAC address.",
                            "It is where you check the installed version and whether Wi-Fi got an IP address.", tag="especial"),
    "Developer mode e Manage my data": D("Development and data management functions.", "",
                                         U("Don’t touch them:", "there is no documentation and you can lose settings."), tag="padrao"),
    "ATS / Scan schemes": D("Stores auto search (ATS) and scan schemes, with band and criteria.",
                            "You switch search setups without redoing everything.", tag="gosto"),
    "My theme": D("Switches the theme on its own among up to 4 favorites, in sequence or at random.", tag="gosto"),
    "Receive plan": D("Turns the radio on and off on a schedule, on a set band and frequency.",
                      "Good for not missing a show at a fixed time.", tag="gosto"),
    "My Shortcut icon": D("Chooses the 7 shortcuts on the shortcuts page.",
                          "It keeps the functions you use most at hand, such as stereo, iMS, EQ, RDS, screen and squelch "
                          "on the knob.",
                          tag="gosto"),
    "Save / Delete my settings": D("Saves your settings as a personal factory default, or deletes that saved set.",
                                   "Once everything is set up, you can return to that point whenever you want.",
                                   U("Note:", "it lives in the file storage and is lost when the firmware is "
                                              "reflashed."), tag="gosto"),
    "Search & save mode": D("How auto search saves: Overwrite erases the band’s memory channels and saves again; Append "
                            "adds after the existing ones.", "",
                            U("Use Append if", "you want to keep the memory channels you already have."), tag="gosto"),
    "Search band": D("Band for the auto search.", tag="gosto"),
    "FM scan sensitivity": sens_busca("FM", ", from 1 to 15", oficial=False),
    "AM scan sensitivity": sens_busca("AM", ", from 1 to 20", oficial=False),
    "Judgment mode": D("Auto search criterion: Quality priority only saves good signals; Quantity priority saves as "
                       "many stations as possible.", "",
                       U("Use Quality priority", "day to day."),
                       U("Use Quantity priority if", "you want to find everything and clean up later."), tag="gosto"),
    "Start channel": D("First memory channel the auto search uses.",
                       "Setting aside a range protects the memory channels you set up by hand.", tag="gosto"),
    "SW search start / stop": D("Shortwave search limits, from 1800 to 27000 kHz.",
                                "Limiting it to a broadcast band, such as 49 m (5900 to 6200 kHz), makes the search "
                                "much faster.", tag="gosto"),
    "Arrange stations": D("Reorganizes the memory channels: only removes the gaps (Only defrag) or removes them and sorts "
                          "by frequency (Defrag and sort).", tag="gosto"),
    "Delete stations": D("Erases all memory channels of the chosen band, not just one.", "",
                         U("Careful:", "it can’t be undone."), tag="especial"),
    "Scanning band": D("DX scan band.", tag="dx"),
    "Begin / End channel": D("First and last memory channel of the scan.", tag="dx"),
    "Wait time": D("Time on each frequency during the scan.",
                   "More time gives a weak station’s RDS a chance to arrive; less time scans faster.", tag="dx"),
    "Exclude / Only": canais_mem("Only", "Exclude"),
    "Cancel": cancelar("Off", "Correct PI", "Signal", oficial=False),
    "Stay / Break": D("What the scan does when it stops on a station: stays on it (Stay) or ends (Break).",
                      tag="dx", obs="Judging by the names; the manual doesn’t go into detail."),
    "Wait on signal only": espera_sinal("On"),
    "Hold time": D("Scan hold time.", tag="dx", obs="The exact function is not documented."),
}


def lookup(fw, nome, grupo):
    d = OFICIAL if fw == "oficial" else MOD17
    return d.get(f"{nome}@{grupo}") or d.get(nome)
