# me - this DAT
# scriptOp - the OP which is cooking

def add_noise_and_ramp_to_null(scriptOp):
    # add noise and ramp to the scriptOp
    noise_node = scriptOp.parent().create(noiseTOP, 'Noise')
    ramp_node = scriptOp.parent().create(rampTOP, 'Ramp')
    null_node = scriptOp.parent().create(nullTOP, 'Null')
    # connect the noise and ramp
    noise_node.inputConnectors[0].connect(ramp_node)
    null_node.inputConnectors[0].connect(noise_node)
    # align node by scriptOp
    margin = 100
    ramp_node.nodeX = scriptOp.nodeX + scriptOp.nodeWidth + margin
    ramp_node.nodeY = scriptOp.nodeY
    noise_node.nodeX = ramp_node.nodeX + ramp_node.nodeWidth + margin
    noise_node.nodeY = scriptOp.nodeY
    null_node.nodeX = noise_node.nodeX + noise_node.nodeWidth + margin
    null_node.nodeY = scriptOp.nodeY
    
def onSetupParameters(scriptOp):
    page = scriptOp.appendCustomPage('Custom')
    # par only allow first letter uppercase
    p = page.appendFloat('Valuea', label='Value A')
    # 設置參數調整設定的方法
    p.default = 0.5
    p.min = 0
    p.max = 1
    p.normMin = 0 # 拉桿最小值
    p.normMax = 1 # 拉桿最大值
    p.clampMin = True
    p.clampMax = True
    # 互動按鈕
    p = page.appendPulse('Addnodes', label='Addnodes')
    # Group特例
    p = page.appendXY('Resolution', label='Resolution')
    p = page.appendRGBA('Color', label='Color')
    return

# Called whenever the custom pulse parameter is pushed
def onPulse(par):
    scriptOp= par.owner
    # Trigger your function here
    if par.name == 'Addnodes':
        add_noise_and_ramp_to_null(scriptOp)
    return

def onCook(scriptOp):
    scriptOp.clear()
    
    # 獲取參數
    valuea = scriptOp.par.Valuea.eval()
    # Group特例
    resolution = scriptOp.parGroup.Resolution.eval()
    return