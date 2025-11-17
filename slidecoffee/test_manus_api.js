const apiKey = process.env.slidecoffee_Mnqk;

const testManusAPI = async () => {
  try {
    console.log("Testing Manus API...");
    console.log("API Key (first 20 chars):", apiKey?.substring(0, 20) + "...");
    
    const response = await fetch("https://api.manus.ai/v1/tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: "Create a simple 3-slide presentation outline about coffee. Just the outline, no full slides needed.",
        mode: "quality"
      })
    });
    
    const data = await response.json();
    
    console.log("\n=== API Response ===");
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
    
    if (data.task_id) {
      console.log("\n✅ SUCCESS! Task created with ID:", data.task_id);
      console.log("\nNow check your Manus dashboard to see if credits decreased!");
    }
    
  } catch (error) {
    console.error("Error:", error.message);
  }
};

testManusAPI();
