
import React, { useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Input,
  List,
  Space,
  Typography,
  Tag,
} from "antd";
import {
  RobotOutlined,
  SendOutlined,
  UserOutlined,
  ClearOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const brands = [
  "Dell",
  "HP",
  "Lenovo",
  "ASUS",
  "Acer",
  "MSI",
  "Gigabyte",
  "Samsung",
  "Toshiba",
  "Other / Not Sure",
];

const biosProblems = [
  "Enter BIOS Setup",
  "Change Boot Order",
  "Boot from USB",
  "Windows Not Booting",
  "Secure Boot Settings",
  "BIOS Reset to Default",
  "BIOS Password Problem",
];

const biosKeys = {
  Dell: "F2",
  HP: "Esc, then F10",
  Lenovo: "F1 or F2 (some models use a Novo button)",
  ASUS: "F2 or Delete",
  Acer: "F2 or Delete",
  MSI: "Delete",
  Gigabyte: "Delete",
  Samsung: "F2",
  Toshiba: "F2",
};

const knowledge = [
  {
    keys: ["create ticket", "new ticket", "raise ticket", "submit ticket"],
    answer:
      "To create a ticket, open Create Ticket. Enter a subject and description, select a category and priority, and submit it. You can track your submitted tickets from My Tickets.",
  },
  {
    keys: ["my tickets", "track ticket", "view my ticket"],
    answer:
      "Open My Tickets to view your submitted tickets. Open a ticket to check its details, status, comments, and updates.",
  },
  {
    keys: ["ticket status", "statuses", "status meaning"],
    answer:
      "Open means a ticket has been created. Assigned means it has been assigned to a staff member. In Progress means work has started. Pending means it is waiting for further information or action. Resolved means a solution has been provided. Closed means the ticket has been formally closed.",
  },
  {
    keys: ["assign ticket", "ticket assignment", "reassign"],
    answer:
      "Authorized staff members can assign or reassign tickets from All Tickets. Only active staff accounts are eligible. Employee accounts cannot be assigned tickets. The selected staff member receives a notification.",
  },
  {
    keys: ["agent", "assigned tickets"],
    answer:
      "Agents can manage tickets according to their permissions. The Assigned Tickets page provides access to tickets assigned to the agent. Authorized staff can also work with tickets from All Tickets.",
  },
  {
    keys: ["employee permission", "employee role"],
    answer:
      "Employees can create tickets, view their own tickets, add comments where permitted, view notifications, and manage their profile and settings. Employees cannot assign tickets or perform staff-only management actions.",
  },
  {
    keys: ["comment", "comments", "add comment"],
    answer:
      "Open a ticket and go to its comments section. Enter your message and submit it to share additional information or a progress update.",
  },
  {
    keys: ["notification", "notifications", "bell", "unread count"],
    answer:
      "Open Notifications to view your notification history. The notification bell displays your unread notification count. You can mark notifications as read using the available actions.",
  },
  {
    keys: ["settings", "save settings", "preferences"],
    answer:
      "Open Settings to update your available preferences. Click Save after making changes. Your settings are stored in the database and remain available after refreshing.",
  },
  {
    keys: ["profile", "account information"],
    answer:
      "Open Profile to view your account information. Available profile details depend on your account configuration.",
  },
  {
    keys: ["audit log", "audit logs"],
    answer:
      "Audit Logs are available to Super Admin accounts. They provide records of supported administrative and system actions, including the user who performed an action.",
  },
  {
    keys: ["user management", "manage users", "change role"],
    answer:
      "Authorized administrators can use User Management to view users and perform permitted actions, such as changing roles, updating passwords, or changing account status.",
  },
  {
    keys: ["forgot password", "reset password", "change password"],
    answer:
      "If you cannot log in, verify your registered email and password. Contact an authorized Super Admin if you need your password changed. Self-service password recovery is not currently confirmed as an available feature.",
  },
  {
    keys: ["login", "sign in", "cannot login"],
    answer:
      "Open the Login page and enter your registered email and password. If login fails, verify your credentials and account status. Contact an administrator if you need assistance.",
  },
  {
    keys: ["logout", "log out", "sign out"],
    answer:
      "Open your account menu and select Logout. You will be redirected to the Login page.",
  },
  {
    keys: ["two factor", "2fa", "otp"],
    answer:
      "Two-factor authentication and OTP verification should only be considered available when implemented and enabled in the system. Contact your administrator for currently enabled security options.",
  },
];

const brandAliases = {
  dell: "Dell",
  hp: "HP",
  "hewlett packard": "HP",
  lenovo: "Lenovo",
  thinkpad: "Lenovo",
  ideapad: "Lenovo",
  asus: "ASUS",
  acer: "Acer",
  msi: "MSI",
  gigabyte: "Gigabyte",
  samsung: "Samsung",
  toshiba: "Toshiba",
};

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const detectBrand = (question) => {
  const text = normalize(question);

  for (const [alias, brand] of Object.entries(brandAliases)) {
    if (
      text === alias ||
      text.includes(` ${alias} `) ||
      text.startsWith(`${alias} `) ||
      text.endsWith(` ${alias}`)
    ) {
      return brand;
    }
  }

  return null;
};

const detectBiosProblem = (question) => {
  const text = normalize(question);

  if (
    text.includes("boot order") ||
    text.includes("boot sequence")
  ) {
    return "Change Boot Order";
  }

  if (
    text.includes("usb boot") ||
    text.includes("boot from usb")
  ) {
    return "Boot from USB";
  }

  if (
    text.includes("windows not boot") ||
    text.includes("windows not starting") ||
    text.includes("boot problem") ||
    text.includes("no bootable device")
  ) {
    return "Windows Not Booting";
  }

  if (
    text.includes("secure boot") ||
    text.includes("secureboot")
  ) {
    return "Secure Boot Settings";
  }

  if (
    text.includes("bios password") ||
    text.includes("password problem")
  ) {
    return "BIOS Password Problem";
  }

  if (
    text.includes("reset bios") ||
    text.includes("default settings") ||
    text.includes("factory default")
  ) {
    return "BIOS Reset to Default";
  }

  if (
    text.includes("enter bios") ||
    text.includes("open bios") ||
    text.includes("bios key") ||
    text.includes("bios setup")
  ) {
    return "Enter BIOS Setup";
  }

  if (
    text.includes("bios") ||
    text.includes("boot")
  ) {
    return "Enter BIOS Setup";
  }

  return null;
};

const getBiosAnswer = (brand, problem) => {
  const key = biosKeys[brand];

  const safety =
    "\n\nImportant: BIOS options vary by model. Do not change SATA/AHCI/RAID mode, Secure Boot, TPM, or UEFI/Legacy settings unless you understand the consequences. If unsure, take photos of the original settings before changing anything.";

  switch (problem) {
    case "Enter BIOS Setup":
      return `${brand} BIOS Setup:\n\n1. Shut down your computer completely.\n2. Turn it on.\n3. Immediately press ${key} repeatedly.\n4. If Windows starts normally, restart and try again.\n5. If the key does not work, check the official support guide for your exact model.\n\nSome models require a different key or a special BIOS/Novo button.${safety}`;

    case "Change Boot Order":
      return `${brand} Boot Order:\n\n1. Restart your computer and enter BIOS using ${key}.\n2. Find Boot, Boot Sequence, or Boot Priority.\n3. Select the required boot device.\n4. Move it to the desired position using the keys shown on screen.\n5. Save changes using the displayed Save & Exit option, commonly F10.\n6. Restart your computer.${safety}`;

    case "Boot from USB":
      return `${brand} USB Boot:\n\n1. Connect your bootable USB drive.\n2. Restart your computer.\n3. Open the Boot Menu or BIOS using ${key}.\n4. Select the USB device from the boot menu.\n5. If required, check the boot settings for USB boot support.\n6. Follow the on-screen instructions.\n\nThe one-time boot menu key may differ from the BIOS setup key. Check your exact model's official manual.${safety}`;

    case "Windows Not Booting":
      return `${brand} Windows Boot Troubleshooting:\n\n1. Disconnect unnecessary USB devices.\n2. Restart the computer.\n3. Enter BIOS using ${key}.\n4. Check whether your SSD or HDD is detected.\n5. Check that Windows Boot Manager is available in the boot list.\n6. Do not change storage mode or delete partitions.\n7. If the drive is missing, shut down and seek hardware inspection.\n8. If the drive is detected but Windows still does not start, use Windows Recovery or Startup Repair.${safety}`;

    case "Secure Boot Settings":
      return `${brand} Secure Boot:\n\n1. Restart and enter BIOS using ${key}.\n2. Find the Security or Boot section.\n3. Locate Secure Boot.\n4. Check its current state.\n5. Change it only if required for a trusted operating system or installation.\n6. Save and restart if you made an intended change.\n\nChanging Secure Boot can affect Windows startup and device security. Do not disable it without a specific reason.${safety}`;

    case "BIOS Reset to Default":
      return `${brand} BIOS Default Settings:\n\n1. Restart and enter BIOS using ${key}.\n2. Find Load Defaults, Restore Defaults, or Setup Defaults.\n3. Read the confirmation message carefully.\n4. Select the default option only if you intend to reset settings.\n5. Save and Exit.\n\nA BIOS reset may change boot order, storage settings, and other configurations. Make sure you know the original settings first.${safety}`;

    case "BIOS Password Problem":
      return `${brand} BIOS Password Help:\n\nIf you forgot a BIOS or firmware password:\n\n1. Do not repeatedly guess passwords.\n2. Identify your exact computer model and ownership details.\n3. Contact the manufacturer's official support or an authorized service center.\n4. Follow their ownership verification and recovery process.\n\nI cannot provide password bypass or security-circumvention instructions.`;

    default:
      return `I can help with ${brand} BIOS troubleshooting. Please describe the exact problem you are facing.`;
  }
};

const getAnswer = (question) => {
  const normalized = normalize(question);

  const match = knowledge
    .map((item) => ({
      item,
      score: item.keys.reduce(
        (score, key) =>
          normalized.includes(normalize(key))
            ? score + normalize(key).split(" ").length + 1
            : score,
        0
      ),
    }))
    .sort((a, b) => b.score - a.score)[0];

  if (match?.score > 0) {
    return match.item.answer;
  }

  return (
    "Sorry, I don't have a verified answer for that question yet.\n\n" +
    "You can ask me about ticket management, BIOS, Windows, networking, printers, hardware, software, or account issues."
  );
};

const AIChatbot = () => {
  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text:
        "Hi! I'm your IT Support Assistant. I can help with Support Ticket System questions and common PC troubleshooting. What problem are you facing?",
      time: new Date(),
    },
  ]);

  const [biosState, setBiosState] = useState({
    active: false,
    brand: null,
    awaiting: null,
  });

  const [pendingSuggestions, setPendingSuggestions] = useState([]);

  const addMessage = (sender, text) => {
    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-${Math.random()}`,
        sender,
        text,
        time: new Date(),
      },
    ]);
  };

  const sendMessage = (value = input) => {
    const question = value.trim();
    if (!question) return;

    addMessage("user", question);
    setInput("");

    const normalized = normalize(question);

    // Brand selection step
    if (biosState.active && biosState.awaiting === "brand") {
      const selectedBrand =
        brands.find(
          (brand) => normalize(brand) === normalized
        ) || detectBrand(question);

      if (!selectedBrand) {
        addMessage(
          "bot",
          "Please select a supported PC or laptop brand from the options below. If you are unsure, choose Other / Not Sure."
        );

        setPendingSuggestions(brands);
        return;
      }

      setBiosState({
        active: true,
        brand: selectedBrand,
        awaiting: "problem",
      });

      addMessage(
        "bot",
        `${selectedBrand} selected. What BIOS or boot problem are you experiencing?`
      );

      setPendingSuggestions(biosProblems);
      return;
    }

    // BIOS problem selection step
    if (biosState.active && biosState.awaiting === "problem") {
      const selectedProblem = biosProblems.find(
        (problem) => normalize(problem) === normalized
      ) || detectBiosProblem(question);

      if (!selectedProblem) {
        addMessage(
          "bot",
          "Please select the BIOS problem you want to solve, or describe it in a few words."
        );

        setPendingSuggestions(biosProblems);
        return;
      }

      if (biosState.brand === "Other / Not Sure") {
        addMessage(
          "bot",
          "Please identify the PC manufacturer and exact model if possible. BIOS keys and settings differ between manufacturers. You can also check the official manufacturer support website."
        );

        setBiosState({
          active: false,
          brand: null,
          awaiting: null,
        });

        setPendingSuggestions([]);
        return;
      }

      addMessage(
        "bot",
        getBiosAnswer(biosState.brand, selectedProblem)
      );

      setBiosState({
        active: false,
        brand: null,
        awaiting: null,
      });

      setPendingSuggestions([]);
      return;
    }

    // Detect BIOS-related request
    const biosProblem = detectBiosProblem(question);

    if (biosProblem) {
      const brand = detectBrand(question);

      if (brand) {
        setBiosState({
          active: true,
          brand,
          awaiting: "problem",
        });

        addMessage(
          "bot",
          `${brand} detected. What BIOS or boot problem are you experiencing?`
        );

        setPendingSuggestions(biosProblems);
      } else {
        setBiosState({
          active: true,
          brand: null,
          awaiting: "brand",
        });

        addMessage(
          "bot",
          "Sure! I can help you with BIOS troubleshooting. First, which PC or laptop brand do you use?"
        );

        setPendingSuggestions(brands);
      }

      return;
    }

    // General PC troubleshooting
    const pcTopics = [
      {
        keys: ["no internet", "internet not working", "wifi not working", "wifi disconnected"],
        answer:
          "Internet Troubleshooting:\n\n1. Check whether Wi-Fi is enabled or the Ethernet cable is connected.\n2. Restart your router and computer.\n3. Check whether other devices can access the internet.\n4. Disconnect and reconnect to Wi-Fi.\n5. Run the Windows Network Troubleshooter.\n6. If the issue continues, contact your network administrator.",
      },
      {
        keys: ["pc slow", "computer slow", "laptop slow", "slow computer"],
        answer:
          "Slow PC Troubleshooting:\n\n1. Restart your computer.\n2. Open Task Manager and check CPU, Memory, and Disk usage.\n3. Close unnecessary applications.\n4. Check available storage space.\n5. Disable unnecessary startup applications.\n6. Run a Windows Security scan.\n7. If the problem continues, check the HDD/SSD and RAM health.",
      },
      {
        keys: ["blue screen", "bsod", "blue screen error"],
        answer:
          "Blue Screen Troubleshooting:\n\n1. Note the error or stop code.\n2. Restart the computer.\n3. Disconnect recently added external devices.\n4. Check for recent driver or Windows updates.\n5. Run Windows Memory Diagnostic if hardware memory is suspected.\n6. Check disk health and system logs.\n\nIf the blue screen repeats, record the stop code before further troubleshooting.",
      },
      {
        keys: ["printer offline", "printer not working", "printer problem"],
        answer:
          "Printer Troubleshooting:\n\n1. Check printer power and cable/network connection.\n2. Check paper and toner/ink.\n3. Make sure the correct printer is selected.\n4. Clear stuck print jobs.\n5. Restart the printer and computer.\n6. Check the printer driver and set the printer online if appropriate.",
      },
      {
        keys: ["keyboard not working", "keyboard problem"],
        answer:
          "Keyboard Troubleshooting:\n\n1. Check the USB or wireless connection.\n2. Try another USB port.\n3. Replace or recharge the batteries if wireless.\n4. Restart your computer.\n5. Test another keyboard.\n6. Check Device Manager for driver problems.",
      },
      {
        keys: ["mouse not working", "mouse problem"],
        answer:
          "Mouse Troubleshooting:\n\n1. Check the USB or wireless connection.\n2. Try another USB port.\n3. Replace or recharge the batteries if wireless.\n4. Restart your computer.\n5. Test another mouse.\n6. Check Device Manager for driver problems.",
      },
      {
        keys: ["monitor no display", "no display", "monitor not working", "black screen"],
        answer:
          "Monitor Troubleshooting:\n\n1. Check the monitor power and power cable.\n2. Check HDMI, DisplayPort, or VGA connections.\n3. Select the correct monitor input source.\n4. Test another cable or monitor if available.\n5. Restart the computer.\n6. If the computer powers on but shows no display, hardware inspection may be required.",
      },
      {
        keys: ["application not opening", "software not opening", "app not opening"],
        answer:
          "Application Troubleshooting:\n\n1. Restart the application.\n2. Restart Windows.\n3. Check whether the application has pending updates.\n4. Run it as administrator only if appropriate.\n5. Check available disk space.\n6. Use the application's repair option if available.\n7. Reinstall only if necessary and after confirming important data is backed up.",
      },
    ];

    const pcMatch = pcTopics
      .map((item) => ({
        item,
        score: item.keys.reduce(
          (score, key) =>
            normalized.includes(normalize(key))
              ? score + normalize(key).split(" ").length + 1
              : score,
          0
        ),
      }))
      .sort((a, b) => b.score - a.score)[0];

    if (pcMatch?.score > 0) {
      addMessage("bot", pcMatch.item.answer);
      setPendingSuggestions([]);
      return;
    }

    addMessage(
      "bot",
      "Sorry, I don't know the solution to this problem yet. Please create a support ticket so our support specialists can assist you. Go to Create Ticket, describe your problem, select a category and priority, and submit your ticket. Our support team will help you resolve it."
    );

    setPendingSuggestions([]);
  };

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: "bot",
        text: "Chat cleared. What can I help you with?",
        time: new Date(),
      },
    ]);

    setBiosState({
      active: false,
      brand: null,
      awaiting: null,
    });

    setPendingSuggestions([]);
  };

  const suggestions = useMemo(
    () => [
      "How do I create a ticket?",
      "My PC is running slowly",
      "My internet is not working",
      "How do I enter BIOS?",
    ],
    []
  );

  return (
    <div
      style={{
        padding: 24,
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <Space align="center" style={{ marginBottom: 20 }}>
        <Avatar
          size={48}
          icon={<RobotOutlined />}
          style={{ background: "#1677ff" }}
        />

        <div>
          <Title level={3} style={{ margin: 0 }}>
            IT Support Assistant
          </Title>

          <Text type="secondary">
            Support Ticket Help and PC Troubleshooting
          </Text>
        </div>
      </Space>

      <Card
        styles={{ body: { padding: 0 } }}
        title="Chat"
        extra={
          <Button
            icon={<ClearOutlined />}
            onClick={clearChat}
          >
            Clear Chat
          </Button>
        }
      >
        <div
          style={{
            height: "min(55vh, 520px)",
            overflowY: "auto",
            padding: 20,
          }}
        >
          <List
            dataSource={messages}
            split={false}
            renderItem={(item) => (
              <List.Item
                style={{
                  border: 0,
                  justifyContent:
                    item.sender === "user"
                      ? "flex-end"
                      : "flex-start",
                }}
              >
                <Space
                  align="start"
                  style={{
                    maxWidth: "90%",
                    flexDirection:
                      item.sender === "user"
                        ? "row-reverse"
                        : "row",
                  }}
                >
                  <Avatar
                    icon={
                      item.sender === "user" ? (
                        <UserOutlined />
                      ) : (
                        <RobotOutlined />
                      )
                    }
                    style={{
                      background:
                        item.sender === "user"
                          ? "#6b7280"
                          : "#1677ff",
                      flexShrink: 0,
                    }}
                  />

                  <div
                    style={{
                      background:
                        item.sender === "user"
                          ? "#e6f4ff"
                          : "#f5f5f5",
                      padding: "10px 14px",
                      borderRadius: 12,
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                    }}
                  >
                    <div>{item.text}</div>

                    <Text
                      type="secondary"
                      style={{ fontSize: 11 }}
                    >
                      {item.time.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </div>
                </Space>
              </List.Item>
            )}
          />
        </div>

        <div
          style={{
            padding: 16,
            borderTop: "1px solid #f0f0f0",
          }}
        >
          {pendingSuggestions.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <Text
                strong
                style={{
                  display: "block",
                  marginBottom: 8,
                }}
              >
                Select an option:
              </Text>

              <Space wrap>
                {pendingSuggestions.map((item) => (
                  <Tag
                    key={item}
                    color="blue"
                    style={{
                      padding: "7px 12px",
                      cursor: "pointer",
                      fontSize: 13,
                    }}
                    onClick={() => sendMessage(item)}
                  >
                    {item}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          <Space wrap style={{ marginBottom: 12 }}>
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion}
                size="small"
                onClick={() => sendMessage(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </Space>

          <Input.Search
            value={input}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onSearch={sendMessage}
            placeholder="Describe your IT problem..."
            enterButton={
              <>
                <SendOutlined /> Send
              </>
            }
            size="large"
          />

          <Text
            type="secondary"
            style={{
              display: "block",
              marginTop: 8,
              fontSize: 12,
            }}
          >
            This is a local FAQ-based assistant. It does not send
            your messages to an external AI service.
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default AIChatbot;
