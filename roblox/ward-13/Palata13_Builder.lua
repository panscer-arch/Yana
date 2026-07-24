-- Палата №13 — Roblox Studio builder
-- Как использовать:
-- 1. Открой Roblox Studio и создай Baseplate.
-- 2. Открой View -> Command Bar.
-- 3. Вставь весь этот файл в Command Bar и нажми Enter.
-- 4. Нажми Play. Карта, предметы, монстр и правила появятся автоматически.

local Workspace = game:GetService("Workspace")
local Lighting = game:GetService("Lighting")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local StarterPlayer = game:GetService("StarterPlayer")
local StarterGui = game:GetService("StarterGui")

local old = Workspace:FindFirstChild("Ward13")
if old then
	old:Destroy()
end

for _, name in ipairs({ "Ward13State", "Ward13LookReport", "Ward13Runtime", "Ward13Client" }) do
	local object = ReplicatedStorage:FindFirstChild(name) or ServerScriptService:FindFirstChild(name)
	if object then
		object:Destroy()
	end
end

local oldClient = StarterPlayer.StarterPlayerScripts:FindFirstChild("Ward13Client")
if oldClient then
	oldClient:Destroy()
end

local oldGui = StarterGui:FindFirstChild("Ward13HUD")
if oldGui then
	oldGui:Destroy()
end

local map = Instance.new("Folder")
map.Name = "Ward13"
map.Parent = Workspace

Lighting.ClockTime = 1.2
Lighting.Brightness = 1.25
Lighting.Ambient = Color3.fromRGB(34, 31, 42)
Lighting.OutdoorAmbient = Color3.fromRGB(19, 17, 24)

local atmosphere = Lighting:FindFirstChildOfClass("Atmosphere") or Instance.new("Atmosphere")
atmosphere.Color = Color3.fromRGB(172, 179, 190)
atmosphere.Decay = Color3.fromRGB(42, 35, 48)
atmosphere.Density = 0.38
atmosphere.Haze = 2.1
atmosphere.Parent = Lighting

local function part(name, size, cframe, color, material, parent)
	local p = Instance.new("Part")
	p.Name = name
	p.Size = size
	p.CFrame = cframe
	p.Color = color
	p.Material = material or Enum.Material.SmoothPlastic
	p.Anchored = true
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.Parent = parent or map
	return p
end

local function label(parent, text, offset)
	local gui = Instance.new("BillboardGui")
	gui.Name = "Label"
	gui.Size = UDim2.fromOffset(180, 36)
	gui.StudsOffset = offset or Vector3.new(0, 3, 0)
	gui.AlwaysOnTop = true
	gui.Parent = parent

	local t = Instance.new("TextLabel")
	t.BackgroundTransparency = 1
	t.Size = UDim2.fromScale(1, 1)
	t.Font = Enum.Font.GothamBlack
	t.Text = text
	t.TextColor3 = Color3.fromRGB(255, 245, 245)
	t.TextScaled = true
	t.TextStrokeTransparency = 0.25
	t.Parent = gui
end

local floor = part("ColdTileFloor", Vector3.new(70, 1, 44), CFrame.new(0, 0, 0), Color3.fromRGB(55, 54, 63), Enum.Material.Concrete)
local corridorFloor = part("CorridorFloor", Vector3.new(22, 1, 20), CFrame.new(46, 0, 0), Color3.fromRGB(47, 45, 55), Enum.Material.Concrete)

for x = -34, 34, 8 do
	part("TileLineZ", Vector3.new(0.12, 0.04, 44), CFrame.new(x, 0.54, 0), Color3.fromRGB(82, 80, 91), Enum.Material.SmoothPlastic)
end
for z = -20, 20, 8 do
	part("TileLineX", Vector3.new(70, 0.04, 0.12), CFrame.new(0, 0.55, z), Color3.fromRGB(82, 80, 91), Enum.Material.SmoothPlastic)
end

part("BackWall", Vector3.new(70, 12, 2), CFrame.new(0, 6, -22), Color3.fromRGB(88, 84, 97), Enum.Material.Concrete)
part("FrontWall", Vector3.new(70, 12, 2), CFrame.new(0, 6, 22), Color3.fromRGB(88, 84, 97), Enum.Material.Concrete)
part("LeftWall", Vector3.new(2, 12, 44), CFrame.new(-35, 6, 0), Color3.fromRGB(88, 84, 97), Enum.Material.Concrete)
part("RightWallA", Vector3.new(2, 12, 16), CFrame.new(35, 6, -14), Color3.fromRGB(88, 84, 97), Enum.Material.Concrete)
part("RightWallB", Vector3.new(2, 12, 16), CFrame.new(35, 6, 14), Color3.fromRGB(88, 84, 97), Enum.Material.Concrete)

part("CorridorBack", Vector3.new(22, 12, 2), CFrame.new(46, 6, -10), Color3.fromRGB(72, 69, 82), Enum.Material.Concrete)
part("CorridorFront", Vector3.new(22, 12, 2), CFrame.new(46, 6, 10), Color3.fromRGB(72, 69, 82), Enum.Material.Concrete)
part("CorridorEnd", Vector3.new(2, 12, 20), CFrame.new(57, 6, 0), Color3.fromRGB(72, 69, 82), Enum.Material.Concrete)

local door = part("ExitDoor", Vector3.new(1.2, 8, 7), CFrame.new(34.4, 4, 0), Color3.fromRGB(74, 44, 38), Enum.Material.Wood)
door:SetAttribute("NeedsItems", true)
label(door, "ВЫХОД", Vector3.new(0, 6, 0))
local doorPrompt = Instance.new("ProximityPrompt")
doorPrompt.Name = "OpenDoorPrompt"
doorPrompt.ActionText = "Открыть дверь"
doorPrompt.ObjectText = "Дверь"
doorPrompt.HoldDuration = 0.15
doorPrompt.MaxActivationDistance = 9
doorPrompt.Parent = door

local bed = part("BedFrame", Vector3.new(18, 2, 9), CFrame.new(-23, 1.2, -12), Color3.fromRGB(155, 148, 137), Enum.Material.Wood)
part("Mattress", Vector3.new(16, 1.1, 7.4), CFrame.new(-23, 2.75, -12), Color3.fromRGB(222, 217, 207), Enum.Material.Fabric)
part("Pillow", Vector3.new(5, 1, 6.2), CFrame.new(-29, 3.55, -12), Color3.fromRGB(160, 217, 255), Enum.Material.Fabric)
part("Blanket", Vector3.new(8, 0.75, 7.2), CFrame.new(-18, 3.72, -12), Color3.fromRGB(180, 170, 199), Enum.Material.Fabric)

part("NightStand", Vector3.new(5, 4, 5), CFrame.new(-29, 2, 7), Color3.fromRGB(112, 102, 117), Enum.Material.Wood)
part("Cabinet", Vector3.new(11, 8, 4), CFrame.new(16, 4, -17.5), Color3.fromRGB(102, 96, 111), Enum.Material.Metal)
part("Table", Vector3.new(13, 2, 6), CFrame.new(2, 3, 13), Color3.fromRGB(95, 88, 103), Enum.Material.Wood)
part("TableLeg1", Vector3.new(1, 5, 1), CFrame.new(-3, 1.5, 10.8), Color3.fromRGB(72, 66, 78), Enum.Material.Wood)
part("TableLeg2", Vector3.new(1, 5, 1), CFrame.new(7, 1.5, 10.8), Color3.fromRGB(72, 66, 78), Enum.Material.Wood)
part("TableLeg3", Vector3.new(1, 5, 1), CFrame.new(-3, 1.5, 15.2), Color3.fromRGB(72, 66, 78), Enum.Material.Wood)
part("TableLeg4", Vector3.new(1, 5, 1), CFrame.new(7, 1.5, 15.2), Color3.fromRGB(72, 66, 78), Enum.Material.Wood)

local wallText = part("WallWriting", Vector3.new(34, 0.1, 5), CFrame.new(-4, 7.5, -20.95) * CFrame.Angles(math.rad(90), 0, 0), Color3.fromRGB(255, 64, 95), Enum.Material.Neon)
label(wallText, "НЕ СМОТРИ НА ПАЦИЕНТОВ, КОГДА МИГАЕТ СВЕТ", Vector3.new(0, 0.3, 0))

local function item(name, displayName, position, color)
	local model = Instance.new("Model")
	model.Name = name
	model.Parent = map

	local p = part(displayName, Vector3.new(2, 0.7, 2), CFrame.new(position), color, Enum.Material.Neon, model)
	p.Shape = Enum.PartType.Ball
	p:SetAttribute("ItemId", name)

	local prompt = Instance.new("ProximityPrompt")
	prompt.ActionText = "Взять"
	prompt.ObjectText = displayName
	prompt.HoldDuration = 0.1
	prompt.MaxActivationDistance = 8
	prompt.Parent = p
	label(p, displayName, Vector3.new(0, 2.5, 0))
	return model
end

item("Key", "Ключ", Vector3.new(18, 5.2, -17), Color3.fromRGB(255, 215, 106))
item("Battery", "Батарейка", Vector3.new(-29, 5.1, 7), Color3.fromRGB(130, 217, 255))
item("Fuse", "Предохранитель", Vector3.new(2, 5.2, 13), Color3.fromRGB(101, 216, 159))

local monster = Instance.new("Model")
monster.Name = "RedPatient"
monster.Parent = map
local monsterRoot = part("HumanoidRootPart", Vector3.new(3, 4, 2), CFrame.new(49, 3, 5), Color3.fromRGB(238, 235, 245), Enum.Material.SmoothPlastic, monster)
monsterRoot.Anchored = false
monster.PrimaryPart = monsterRoot
local monsterHead = part("Head", Vector3.new(3, 2.6, 2.6), CFrame.new(49, 6.2, 5), Color3.fromRGB(218, 210, 199), Enum.Material.SmoothPlastic, monster)
monsterHead.Anchored = false
local monsterHair = part("Hair", Vector3.new(3.6, 0.8, 2.8), CFrame.new(49, 7.6, 5), Color3.fromRGB(26, 21, 32), Enum.Material.SmoothPlastic, monster)
monsterHair.Anchored = false
for _, p in ipairs(monster:GetChildren()) do
	if p:IsA("BasePart") and p ~= monsterRoot then
		local weld = Instance.new("WeldConstraint")
		weld.Part0 = monsterRoot
		weld.Part1 = p
		weld.Parent = p
	end
end
local humanoid = Instance.new("Humanoid")
humanoid.WalkSpeed = 12
humanoid.DisplayName = "Красный пациент"
humanoid.Parent = monster
label(monsterHead, "пациент", Vector3.new(0, 2.5, 0))

local spawn = Instance.new("SpawnLocation")
spawn.Name = "Ward13Spawn"
spawn.Size = Vector3.new(6, 1, 6)
spawn.CFrame = CFrame.new(-23, 0.6, 10)
spawn.Color = Color3.fromRGB(130, 217, 255)
spawn.Material = Enum.Material.Neon
spawn.Anchored = true
spawn.Parent = map

local redLight = Instance.new("PointLight")
redLight.Name = "RedAlarmLight"
redLight.Color = Color3.fromRGB(255, 64, 95)
redLight.Brightness = 0
redLight.Range = 70
redLight.Parent = door

local roomLight = Instance.new("PointLight")
roomLight.Name = "RoomLight"
roomLight.Color = Color3.fromRGB(225, 238, 255)
roomLight.Brightness = 1.7
roomLight.Range = 55
roomLight.Parent = bed

local stateValue = Instance.new("StringValue")
stateValue.Name = "Ward13State"
stateValue.Value = "White"
stateValue.Parent = ReplicatedStorage

local lookReport = Instance.new("RemoteEvent")
lookReport.Name = "Ward13LookReport"
lookReport.Parent = ReplicatedStorage

local runtime = Instance.new("Script")
runtime.Name = "Ward13Runtime"
runtime.Parent = ServerScriptService
runtime.Source = [=[
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local TweenService = game:GetService("TweenService")

local map = workspace:WaitForChild("Ward13")
local monster = map:WaitForChild("RedPatient")
local monsterHumanoid = monster:WaitForChild("Humanoid")
local monsterRoot = monster:WaitForChild("HumanoidRootPart")
local door = map:WaitForChild("ExitDoor")
local roomLight = map.BedFrame:WaitForChild("RoomLight")
local redLight = door:WaitForChild("RedAlarmLight")
local stateValue = ReplicatedStorage:WaitForChild("Ward13State")
local lookReport = ReplicatedStorage:WaitForChild("Ward13LookReport")

local reports = {}
local required = { Key = true, Battery = true, Fuse = true }

local function giveItem(player, itemId)
	local folder = player:FindFirstChild("Ward13Items")
	if not folder then
		folder = Instance.new("Folder")
		folder.Name = "Ward13Items"
		folder.Parent = player
	end
	if not folder:FindFirstChild(itemId) then
		local value = Instance.new("BoolValue")
		value.Name = itemId
		value.Value = true
		value.Parent = folder
	end
end

local function hasAllItems(player)
	local folder = player:FindFirstChild("Ward13Items")
	if not folder then
		return false
	end
	for itemId in pairs(required) do
		if not folder:FindFirstChild(itemId) then
			return false
		end
	end
	return true
end

for _, model in ipairs(map:GetChildren()) do
	if model:IsA("Model") then
		local itemPart = model:FindFirstChildWhichIsA("BasePart")
		if itemPart and itemPart:GetAttribute("ItemId") then
			local prompt = itemPart:FindFirstChildOfClass("ProximityPrompt")
			if prompt then
				prompt.Triggered:Connect(function(player)
					giveItem(player, itemPart:GetAttribute("ItemId"))
					model:Destroy()
				end)
			end
		end
	end
end

door.OpenDoorPrompt.Triggered:Connect(function(player)
	if hasAllItems(player) then
		door.CanCollide = false
		TweenService:Create(door, TweenInfo.new(0.7, Enum.EasingStyle.Back), {
			CFrame = door.CFrame * CFrame.new(0, 0, -7) * CFrame.Angles(0, math.rad(86), 0)
		}):Play()
		task.delay(0.7, function()
			local gui = player.PlayerGui:FindFirstChild("Ward13HUD")
			if gui then
				gui.Ending.Visible = true
				gui.Ending.Text = "Пациент снимает маску: Фух... наконец-то ты дошла. Я уже два часа за тобой бегаю."
			end
		end)
	else
		local gui = player.PlayerGui:FindFirstChild("Ward13HUD")
		if gui then
			gui.Message.Text = "Дверь заперта. Нужны ключ, батарейка и предохранитель."
		end
	end
end)

lookReport.OnServerEvent:Connect(function(player, seesMonster, moving)
	reports[player] = {
		sees = seesMonster == true,
		moving = moving == true,
		time = os.clock(),
	}
end)

local redMode = false
task.spawn(function()
	while true do
		task.wait(redMode and 7 or 18)
		redMode = not redMode
		stateValue.Value = redMode and "Red" or "White"
		roomLight.Brightness = redMode and 0.18 or 1.7
		redLight.Brightness = redMode and 5 or 0
		for _, player in ipairs(Players:GetPlayers()) do
			local gui = player.PlayerGui:FindFirstChild("Ward13HUD")
			if gui then
				gui.Message.Text = redMode and "СИРЕНА. Красный свет: стой неподвижно." or "Свет белый. Смотри на пациента, чтобы он замер."
			end
		end
	end
end)

local function closestPlayer()
	local bestPlayer = nil
	local bestDistance = math.huge
	for _, player in ipairs(Players:GetPlayers()) do
		local character = player.Character
		local root = character and character:FindFirstChild("HumanoidRootPart")
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if root and humanoid and humanoid.Health > 0 then
			local distance = (root.Position - monsterRoot.Position).Magnitude
			if distance < bestDistance then
				bestDistance = distance
				bestPlayer = player
			end
		end
	end
	return bestPlayer, bestDistance
end

while true do
	task.wait(0.25)
	local player, distance = closestPlayer()
	if player and player.Character then
		local root = player.Character:FindFirstChild("HumanoidRootPart")
		local humanoid = player.Character:FindFirstChildOfClass("Humanoid")
		local report = reports[player]
		local seen = report and report.sees and os.clock() - report.time < 0.7
		local moving = report and report.moving and os.clock() - report.time < 0.7
		local shouldChase = false

		if redMode then
			shouldChase = moving
			monsterHumanoid.WalkSpeed = 28
		else
			shouldChase = not seen
			monsterHumanoid.WalkSpeed = 12
		end

		if shouldChase and root then
			monsterHumanoid:MoveTo(root.Position)
		else
			monsterHumanoid:MoveTo(monsterRoot.Position)
		end

		if distance < 5 and humanoid then
			humanoid.Health = 0
		end
	end
end
]=]

local client = Instance.new("LocalScript")
client.Name = "Ward13Client"
client.Parent = StarterPlayer.StarterPlayerScripts
client.Source = [=[
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local player = Players.LocalPlayer
local lookReport = ReplicatedStorage:WaitForChild("Ward13LookReport")
local stateValue = ReplicatedStorage:WaitForChild("Ward13State")

local gui = Instance.new("ScreenGui")
gui.Name = "Ward13HUD"
gui.ResetOnSpawn = false
gui.Parent = player:WaitForChild("PlayerGui")

local message = Instance.new("TextLabel")
message.Name = "Message"
message.AnchorPoint = Vector2.new(0.5, 1)
message.Position = UDim2.fromScale(0.5, 0.97)
message.Size = UDim2.fromOffset(720, 54)
message.BackgroundColor3 = Color3.fromRGB(14, 12, 20)
message.BackgroundTransparency = 0.15
message.BorderSizePixel = 0
message.Font = Enum.Font.GothamBlack
message.TextColor3 = Color3.fromRGB(255, 255, 255)
message.TextScaled = true
message.Text = "Найди ключ, батарейку и предохранитель."
message.Parent = gui

local lightLabel = Instance.new("TextLabel")
lightLabel.Name = "Light"
lightLabel.Position = UDim2.fromOffset(16, 16)
lightLabel.Size = UDim2.fromOffset(260, 44)
lightLabel.BackgroundColor3 = Color3.fromRGB(14, 12, 20)
lightLabel.BackgroundTransparency = 0.15
lightLabel.BorderSizePixel = 0
lightLabel.Font = Enum.Font.GothamBlack
lightLabel.TextColor3 = Color3.fromRGB(190, 235, 255)
lightLabel.TextScaled = true
lightLabel.Text = "СВЕТ: БЕЛЫЙ"
lightLabel.Parent = gui

local ending = Instance.new("TextLabel")
ending.Name = "Ending"
ending.AnchorPoint = Vector2.new(0.5, 0.5)
ending.Position = UDim2.fromScale(0.5, 0.5)
ending.Size = UDim2.fromOffset(760, 180)
ending.BackgroundColor3 = Color3.fromRGB(14, 12, 20)
ending.BackgroundTransparency = 0.05
ending.BorderSizePixel = 0
ending.Font = Enum.Font.GothamBlack
ending.TextColor3 = Color3.fromRGB(255, 215, 106)
ending.TextScaled = true
ending.TextWrapped = true
ending.Visible = false
ending.Parent = gui

stateValue.Changed:Connect(function(value)
	if value == "Red" then
		lightLabel.Text = "СВЕТ: КРАСНЫЙ"
		lightLabel.TextColor3 = Color3.fromRGB(255, 120, 145)
	else
		lightLabel.Text = "СВЕТ: БЕЛЫЙ"
		lightLabel.TextColor3 = Color3.fromRGB(190, 235, 255)
	end
end)

local lastPosition = nil
local sendTimer = 0
RunService.RenderStepped:Connect(function(dt)
	sendTimer += dt
	if sendTimer < 0.15 then
		return
	end
	sendTimer = 0

	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	local monster = workspace:FindFirstChild("Ward13") and workspace.Ward13:FindFirstChild("RedPatient")
	local monsterRoot = monster and monster:FindFirstChild("HumanoidRootPart")
	local camera = workspace.CurrentCamera
	if not root or not monsterRoot or not camera then
		return
	end

	local toMonster = (monsterRoot.Position - camera.CFrame.Position)
	local distance = toMonster.Magnitude
	local dot = camera.CFrame.LookVector:Dot(toMonster.Unit)
	local sees = distance < 70 and dot > 0.72
	local moving = false
	if lastPosition then
		moving = (root.Position - lastPosition).Magnitude > 0.08
	end
	lastPosition = root.Position
	lookReport:FireServer(sees, moving)
end)
]=]

local readme = Instance.new("StringValue")
readme.Name = "Ward13Notes"
readme.Value = "Палата №13 создана builder-скриптом. Нажми Play: собери ключ, батарейку, предохранитель и открой дверь. Красный свет — стой."
readme.Parent = map

print("Готово: карта Roblox Studio 'Палата №13' создана. Нажми Play.")
